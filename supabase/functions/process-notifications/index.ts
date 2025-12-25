import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Processing scheduled notifications...');

    const now = new Date().toISOString();

    // Get all unsent notifications that are scheduled for now or earlier
    const { data: pendingNotifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('sent', false)
      .lte('scheduled_for', now);

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingNotifications?.length || 0} pending notifications`);

    if (!pendingNotifications || pendingNotifications.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending notifications', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group notifications by household code for push notifications
    const notificationsByHousehold: Record<string, typeof pendingNotifications> = {};
    for (const notification of pendingNotifications) {
      if (!notificationsByHousehold[notification.household_code]) {
        notificationsByHousehold[notification.household_code] = [];
      }
      notificationsByHousehold[notification.household_code].push(notification);
    }

    // Send push notifications for each household
    for (const [householdCode, notifications] of Object.entries(notificationsByHousehold)) {
      for (const notification of notifications) {
        try {
          // Get push subscriptions for this household
          const { data: subscriptions } = await supabase
            .from('push_subscriptions')
            .select('endpoint, p256dh, auth')
            .eq('household_code', householdCode);

          if (subscriptions && subscriptions.length > 0) {
            console.log(`Sending push to ${subscriptions.length} devices for household ${householdCode}`);
            
            // Send push notification to each subscription
            for (const sub of subscriptions) {
              try {
                const payload = {
                  title: getNotificationTitle(notification.notification_type),
                  body: notification.message,
                  icon: '/favicon.ico',
                  tag: notification.id,
                  data: {
                    eventId: notification.event_id,
                    todoId: notification.todo_id,
                    url: notification.event_id ? `/events?id=${notification.event_id}` : '/todos',
                  },
                };

                // Simple push without encryption for basic notifications
                const response = await fetch(sub.endpoint, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'TTL': '86400',
                  },
                  body: JSON.stringify(payload),
                });

                if (!response.ok) {
                  console.error(`Push failed for endpoint: ${sub.endpoint}`, await response.text());
                  // Remove expired subscription
                  if (response.status === 410 || response.status === 404) {
                    await supabase
                      .from('push_subscriptions')
                      .delete()
                      .eq('endpoint', sub.endpoint);
                  }
                } else {
                  console.log(`Push sent successfully to ${sub.endpoint}`);
                }
              } catch (pushError) {
                console.error('Error sending individual push:', pushError);
              }
            }
          }
        } catch (error) {
          console.error('Error sending push notifications:', error);
        }
      }
    }

    // Mark notifications as sent
    const notificationIds = pendingNotifications.map((n) => n.id);
    
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ 
        sent: true, 
        sent_at: now 
      })
      .in('id', notificationIds);

    if (updateError) {
      console.error('Error updating notifications:', updateError);
      throw updateError;
    }

    console.log(`Processed ${notificationIds.length} notifications`);

    return new Response(
      JSON.stringify({ 
        message: 'Notifications processed successfully',
        count: notificationIds.length,
        ids: notificationIds
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing notifications:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function getNotificationTitle(type: string): string {
  switch (type) {
    case 'event_reminder':
      return '📅 Event Reminder';
    case 'todo_reminder':
      return '✓ Task Reminder';
    case 'deadline':
      return '⏰ Deadline Alert';
    default:
      return '🔔 Family Calendar';
  }
}
