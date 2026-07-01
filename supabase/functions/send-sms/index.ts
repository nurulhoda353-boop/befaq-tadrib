import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch All Active SMS Settings ordered by Priority
    const { data: gateways, error: settingsErr } = await supabaseClient
      .from("sms_settings")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: true })

    if (settingsErr || !gateways || gateways.length === 0) {
      console.error('SMS Settings not found or inactive:', settingsErr)
      return new Response(JSON.stringify({ error: 'কোনো অ্যাকটিভ SMS গেটওয়ে পাওয়া যায়নি' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 2. Format Phone Number (Ensure +880)
    let cleanPhone = phone_number.replace(/\D/g, "");
    if (cleanPhone.startsWith("0") && cleanPhone.length === 11) {
      cleanPhone = "+88" + cleanPhone;
    } else if (!cleanPhone.startsWith("+")) {
      cleanPhone = "+" + cleanPhone;
    }

    let isSuccess = false;
    let statusText = "failed";
    let lastError = "No gateways available";
    let successfulGatewayId = null;
    let apiResponse: any = {};

    // 3. Fallback Loop
    for (const gateway of gateways) {
      if (!gateway.api_key) continue;

      try {
        if (gateway.provider === "textbee") {
          if (!gateway.device_id) continue;
          
          const apiUrl = `https://api.textbee.dev/api/v1/gateway/devices/${gateway.device_id}/send-sms`;
          
          let res = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": gateway.api_key,
            },
            body: JSON.stringify({
              recipients: [cleanPhone],
              message: message,
            }),
          });

          const responseText = await res.text();
          try { apiResponse = JSON.parse(responseText); } catch(e) { apiResponse = { raw: responseText }; }

          if (res.ok) {
            isSuccess = true;
            statusText = "sent";
            successfulGatewayId = gateway.id;
            break;
          } else {
            lastError = `TextBee (${gateway.name}): ${responseText}`;
            console.error(lastError);
            continue;
          }
        }
        else if (gateway.provider === "owntext") {
          if (!gateway.device_id) continue;
          
          const apiUrl = `https://owntext.vercel.app/api/v1/send`;
          
          let res = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${gateway.api_key}`,
            },
            body: JSON.stringify({
              recipient: cleanPhone,
              message: message,
              device_id: gateway.device_id
            }),
          });

          const responseText = await res.text();
          try { apiResponse = JSON.parse(responseText); } catch(e) { apiResponse = { raw: responseText }; }

          if (res.ok) {
            isSuccess = true;
            statusText = "sent";
            successfulGatewayId = gateway.id;
            break; 
          } else {
            lastError = `OwnText (${gateway.name}): ${responseText}`;
            console.error(lastError);
            continue; 
          }
        } 
        else if (gateway.provider === "smsnetbd") {
          const url = "https://api.sms.net.bd/sendsms";
          const payload = {
            api_key: gateway.api_key,
            msg: message,
            to: cleanPhone.replace('+88', ''),
            sender_id: gateway.sender_id || ""
          };
          
          let res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          const responseText = await res.text();
          try { apiResponse = JSON.parse(responseText); } catch(e) { apiResponse = { raw: responseText }; }

          if (res.ok && (!apiResponse.error || apiResponse.error === 0 || apiResponse.error === "0")) {
            isSuccess = true;
            statusText = "sent";
            successfulGatewayId = gateway.id;
            break;
          } else {
            lastError = `SMS.net.bd (${gateway.name}): ${responseText}`;
            console.error(lastError);
            continue;
          }
        }
        else if (gateway.provider === "bulksmsbd") {
          const senderId = gateway.sender_id || "";
          const url = `http://bulksmsbd.net/api/smsapi?api_key=${gateway.api_key}&type=text&number=${cleanPhone.replace('+88', '')}&senderid=${senderId}&message=${encodeURIComponent(message)}`;
          
          const res = await fetch(url);

          const responseText = await res.text();
          apiResponse = { raw: responseText };

          if (res.ok && !responseText.toLowerCase().includes("error")) {
            isSuccess = true;
            statusText = "sent";
            successfulGatewayId = gateway.id;
            break;
          } else {
            lastError = `BulkSMS BD (${gateway.name}): ${responseText}`;
            console.error(lastError);
            continue;
          }
        }
        else if (gateway.provider === "greenweb") {
          const url = `http://api.greenweb.com.bd/api.php?token=${gateway.api_key}&to=${cleanPhone}&message=${encodeURIComponent(message)}`;
          
          const res = await fetch(url);

          const responseText = await res.text();
          apiResponse = { raw: responseText };

          if (res.ok && !responseText.toLowerCase().includes("error")) {
            isSuccess = true;
            statusText = "sent";
            successfulGatewayId = gateway.id;
            break;
          } else {
            lastError = `GreenWeb (${gateway.name}): ${responseText}`;
            console.error(lastError);
            continue;
          }
        }
      } catch (err: any) {
        lastError = `Exception in gateway ${gateway.name}: ${err.message}`;
        console.error(lastError);
        continue;
      }
    }

    // 4. Update Gateway Usage Count if successful
    if (isSuccess && successfulGatewayId) {
      const successfulGateway = gateways.find(g => g.id === successfulGatewayId);
      if (successfulGateway) {
        await supabaseClient
          .from("sms_settings")
          .update({ usage_count: (successfulGateway.usage_count || 0) + 1 })
          .eq("id", successfulGatewayId);
      }
    }

    // 5. Create Log Entry
    await supabaseClient.from("sms_logs").insert({
      phone_number: cleanPhone,
      message,
      status: statusText,
      provider_response: apiResponse,
    });

    return new Response(JSON.stringify({ 
      success: isSuccess, 
      status: statusText,
      error: isSuccess ? null : lastError,
      response: apiResponse 
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
