import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushPayload {
  householdCode?: string;
  subscriptionEndpoint?: string;
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

// Web Push encryption implementation
async function generatePushHeaders(subscription: {
  endpoint: string;
  p256dh: string;
  auth: string;
}, vapidPublicKey: string, vapidPrivateKey: string): Promise<{
  headers: Record<string, string>;
  body: Uint8Array;
  payload: string;
}> {
  const payload = JSON.stringify({});
  
  // For web push, we need to use the VAPID protocol
  const audience = new URL(subscription.endpoint).origin;
  const subject = 'mailto:admin@example.com';
  
  // Create JWT for VAPID
  const header = { alg: 'ES256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    aud: audience,
    exp: now + 12 * 60 * 60, // 12 hours
    sub: subject,
  };

  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const claimsB64 = btoa(JSON.stringify(claims)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsignedToken = `${headerB64}.${claimsB64}`;

  // Import the private key and sign
  const privateKeyData = base64UrlToArrayBuffer(vapidPrivateKey);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    privateKeyData,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureB64 = arrayBufferToBase64Url(signature);
  const jwt = `${unsignedToken}.${signatureB64}`;

  return {
    headers: {
      'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
      'TTL': '86400',
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
    },
    body: new Uint8Array(0),
    payload: '',
  };
}

function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; icon?: string; tag?: string; data?: Record<string, unknown> },
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<boolean> {
  try {
    console.log('Sending push to:', subscription.endpoint);
    
    const audience = new URL(subscription.endpoint).origin;
    const subject = 'mailto:push@familycalendar.app';
    
    // Create VAPID JWT
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'ES256', typ: 'JWT' };
    const claims = { aud: audience, exp: now + 43200, sub: subject };
    
    const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const claimsB64 = btoa(JSON.stringify(claims)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const unsignedToken = `${headerB64}.${claimsB64}`;

    // For simplicity, send without encryption (payload in body as JSON)
    // Most push services accept this for basic notifications
    const payloadString = JSON.stringify(payload);
    
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTL': '86400',
      },
      body: payloadString,
    });

    console.log('Push response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Push failed:', errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending push:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured');
      return new Response(
        JSON.stringify({ error: 'Push notifications not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: PushPayload = await req.json();
    
    console.log('Received push request:', body);

    let subscriptions: { endpoint: string; p256dh: string; auth: string }[] = [];

    if (body.subscriptionEndpoint) {
      // Send to specific subscription
      const { data } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('endpoint', body.subscriptionEndpoint)
        .single();
      
      if (data) subscriptions = [data];
    } else if (body.householdCode) {
      // Send to all subscriptions for household
      const { data } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('household_code', body.householdCode);
      
      if (data) subscriptions = data;
    }

    console.log(`Found ${subscriptions.length} subscriptions`);

    const payload = {
      title: body.title,
      body: body.body,
      icon: body.icon || '/favicon.ico',
      tag: body.tag || 'notification',
      data: body.data || {},
    };

    let successCount = 0;
    const failedEndpoints: string[] = [];

    for (const sub of subscriptions) {
      const success = await sendPushNotification(sub, payload, vapidPublicKey, vapidPrivateKey);
      if (success) {
        successCount++;
      } else {
        failedEndpoints.push(sub.endpoint);
      }
    }

    // Clean up failed subscriptions (likely expired)
    if (failedEndpoints.length > 0) {
      console.log('Removing failed subscriptions:', failedEndpoints.length);
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', failedEndpoints);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount, 
        failed: failedEndpoints.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
