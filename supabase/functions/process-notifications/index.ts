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

    // Here you could add push notification logic or email sending
    // For now, we just mark them as sent so they appear in the in-app notifications

    return new Response(
      JSON.stringify({ 
        message: 'Notifications processed successfully',
        count: notificationIds.length,
        ids: notificationIds
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error processing notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
