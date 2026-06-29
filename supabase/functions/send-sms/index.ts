import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone_number, message } = await req.json()

    if (!phone_number || !message) {
      return new Response(JSON.stringify({ error: 'phone_number and message are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Initialize Supabase client with Service Role key to bypass RLS
    // We need service role to read sms_settings which is hidden from anon/regular users
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch the active SMS settings (TextBee)
    const { data: settings, error: settingsError } = await supabaseClient
      .from('sms_settings')
      .select('*')
      .eq('is_active', true)
      .single()

    if (settingsError || !settings) {
      console.error('SMS Settings not found or inactive:', settingsError)
      return new Response(JSON.stringify({ error: 'SMS service is not configured or inactive' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (settings.provider !== 'textbee' || !settings.api_key || !settings.device_id) {
      return new Response(JSON.stringify({ error: 'TextBee configuration is incomplete' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Log the SMS as pending
    const { data: logEntry, error: logError } = await supabaseClient
      .from('sms_logs')
      .insert({
        phone_number,
        message,
        status: 'pending'
      })
      .select()
      .single()
      
    if (logError) {
      console.error("Failed to insert log:", logError)
    }

    const logId = logEntry?.id;

    // Call TextBee API
    // Doc: POST https://api.textbee.dev/api/v1/gateway/devices/{DEVICE_ID}/send-sms
    // Header: x-api-key
    // Body: { "recipients": [phone_number], "message": message }
    
    let textbeeResponse;
    let isSuccess = false;
    let statusText = 'failed';

    try {
      // Clean phone number (ensure +880 format for BD)
      let cleanPhone = phone_number.replace(/\D/g, '');
      if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
        cleanPhone = '+88' + cleanPhone;
      } else if (!cleanPhone.startsWith('+')) {
        cleanPhone = '+' + cleanPhone;
      }

      const res = await fetch(`https://api.textbee.dev/api/v1/gateway/devices/${settings.device_id}/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': settings.api_key
        },
        body: JSON.stringify({
          recipients: [cleanPhone],
          message: message
        })
      });

      const responseText = await res.text();
      let responseJson;
      try {
        responseJson = JSON.parse(responseText);
      } catch (e) {
        responseJson = { raw: responseText };
      }

      textbeeResponse = responseJson;
      
      if (res.ok) {
        isSuccess = true;
        statusText = 'sent';
      } else {
        console.error("TextBee API Error:", responseText);
      }
    } catch (apiError: any) {
      textbeeResponse = { error: apiError.message || String(apiError) };
      console.error("Fetch Error:", apiError);
    }

    // Update log entry
    if (logId) {
      await supabaseClient
        .from('sms_logs')
        .update({
          status: statusText,
          provider_response: textbeeResponse
        })
        .eq('id', logId)
    }

    return new Response(JSON.stringify({ 
      success: isSuccess, 
      status: statusText,
      response: textbeeResponse 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: isSuccess ? 200 : 500,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
