import { supabase } from "@/integrations/supabase/client";

/**
 * Sends notifications (SMS via TextBee) when a registration is confirmed.
 * This runs securely in the admin's browser.
 */
export async function sendConfirmationDetails(regId: string) {
  try {
    // 1. Fetch registration details
    const { data: reg, error: fetchErr } = await supabase
      .from("event_registrations")
      .select("registration_id, form_data, event_id, events(title)")
      .eq("id", regId)
      .single();

    if (fetchErr || !reg) {
      console.error("Failed to fetch registration for notification:", fetchErr);
      return { success: false, error: "Registration not found" };
    }

    // 2. Extract phone number and name from form_data
    const formData = (reg.form_data as Record<string, any>) || {};
    const phone = formData["মোবাইল নাম্বার"] || formData["মোবাইল"] || formData["ফোন"] || formData["Phone"] || formData["Mobile"];
    let name = formData["নাম"] || formData["Name"] || formData["আপনার নাম"] || "অংশগ্রহণকারী";

    if (!phone) {
      console.log("No phone number found in form data for SMS. Skipping.");
      return { success: false, error: "No phone number found" };
    }

    // 3. Construct SMS Message
    const eventTitle = (reg.events as any)?.title || "ইভেন্ট";
    const message = `অভিনন্দন ${name}!\n"${eventTitle}"-এ আপনার রেজিস্ট্রেশন সফলভাবে কনফার্ম হয়েছে।\nআপনার আইডি: ${reg.registration_id}`;

    console.log("Sending SMS directly via TextBee to:", phone);

    return await sendDirectSms(phone, message);
  } catch (err: any) {
    console.error("Unexpected error in sendConfirmationDetails:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Sends SMS directly from the client using TextBee API.
 * Secure because this is only called by authenticated admins, 
 * and sms_settings is protected by RLS.
 */
export async function sendDirectSms(phone: string, message: string) {
  try {
    // 1. Fetch All Active SMS Settings ordered by Priority
    const { data: gateways, error: settingsErr } = await supabase
      .from("sms_settings")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: true });

    if (settingsErr || !gateways || gateways.length === 0) {
      return { success: false, error: "কোনো অ্যাকটিভ SMS গেটওয়ে পাওয়া যায়নি" };
    }

    // 2. Format Phone Number (Ensure +880)
    let cleanPhone = phone.replace(/\D/g, "");
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
        if (gateway.provider === "textbee" || gateway.provider === "owntext") {
          if (!gateway.device_id) continue;
          
          const baseUrl = gateway.provider === "owntext" ? "https://owntext.vercel.app" : "https://api.textbee.dev";
          const apiUrl = `${baseUrl}/api/v1/gateway/devices/${gateway.device_id}/send-sms`;
          
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
          }).catch(async (e) => {
            // CORS Fallback for local dev
            console.log("CORS issue, trying proxy...");
            return fetch(`https://corsproxy.io/?url=${encodeURIComponent(apiUrl)}`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-api-key": gateway.api_key },
              body: JSON.stringify({ recipients: [cleanPhone], message: message }),
            });
          });

          const responseText = await res.text();
          try { apiResponse = JSON.parse(responseText); } catch(e) { apiResponse = { raw: responseText }; }

          if (res.ok) {
            isSuccess = true;
            statusText = "sent";
            successfulGatewayId = gateway.id;
            break; // Stop loop, SMS sent successfully
          } else {
            lastError = `${gateway.provider} (${gateway.name}): ${responseText}`;
            console.error(lastError);
            continue; // Try next gateway
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
          }).catch(async () => {
             return fetch(\`https://corsproxy.io/?url=\${encodeURIComponent(url)}\`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
             });
          });

          const responseText = await res.text();
          try { apiResponse = JSON.parse(responseText); } catch(e) { apiResponse = { raw: responseText }; }

          // sms.net.bd returns { error: 0, ... } on success
          if (res.ok && (!apiResponse.error || apiResponse.error === 0 || apiResponse.error === "0")) {
            isSuccess = true;
            statusText = "sent";
            successfulGatewayId = gateway.id;
            break;
          } else {
            lastError = \`SMS.net.bd (\${gateway.name}): \${responseText}\`;
            console.error(lastError);
            continue;
          }
        }
        else if (gateway.provider === "bulksmsbd" || gateway.provider === "greenweb" || gateway.provider === "other") {
          // Placeholder for other BD Bulk SMS APIs. Usually they are simple GET requests.
          // e.g. BulkSmsBD
          const senderId = gateway.sender_id || "";
          const url = `http://bulksmsbd.net/api/smsapi?api_key=${gateway.api_key}&type=text&number=${cleanPhone.replace('+88', '')}&senderid=${senderId}&message=${encodeURIComponent(message)}`;
          
          const res = await fetch(url).catch(async () => {
             return fetch(`https://corsproxy.io/?url=${encodeURIComponent(url)}`);
          });

          const responseText = await res.text();
          apiResponse = { raw: responseText };

          // Typically they return something with success code
          if (res.ok && !responseText.toLowerCase().includes("error")) {
            isSuccess = true;
            statusText = "sent";
            successfulGatewayId = gateway.id;
            break;
          } else {
            lastError = `Bulk API (${gateway.name}): ${responseText}`;
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
        await supabase
          .from("sms_settings")
          .update({ usage_count: (successfulGateway.usage_count || 0) + 1 })
          .eq("id", successfulGatewayId);
      }
    }

    // 5. Create Log Entry
    await supabase.from("sms_logs").insert({
      phone_number: phone,
      message,
      status: statusText,
      api_response: apiResponse,
    });

    if (isSuccess) return { success: true };
    return { success: false, error: lastError };
  } catch (err: any) {
    console.error("SMS Error:", err);
    return { success: false, error: err.message };
  }
}
