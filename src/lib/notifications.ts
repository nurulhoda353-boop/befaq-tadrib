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
    // 1. Fetch SMS Settings
    const { data: settings, error: settingsErr } = await supabase
      .from("sms_settings")
      .select("*")
      .eq("is_active", true)
      .single();

    if (settingsErr || !settings) {
      return { success: false, error: "SMS service is not configured or inactive" };
    }

    if (settings.provider !== "textbee" || !settings.api_key || !settings.device_id) {
      return { success: false, error: "TextBee configuration is incomplete" };
    }

    // 2. Create a pending log entry
    const { data: logEntry } = await supabase
      .from("sms_logs")
      .insert({ phone_number: phone, message, status: "pending" })
      .select()
      .single();

    const logId = logEntry?.id;

    // 3. Format Phone Number (Ensure +880)
    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0") && cleanPhone.length === 11) {
      cleanPhone = "+88" + cleanPhone;
    } else if (!cleanPhone.startsWith("+")) {
      cleanPhone = "+" + cleanPhone;
    }

    // 4. Call TextBee API
    const textbeeUrl = `https://api.textbee.dev/api/v1/gateway/devices/${settings.device_id}/send-sms`;
    
    let isSuccess = false;
    let statusText = "failed";
    let textbeeResponse: any = {};

    try {
      const res = await fetch(textbeeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": settings.api_key,
        },
        body: JSON.stringify({
          recipients: [cleanPhone],
          message: message,
        }),
      });

      const responseText = await res.text();
      try {
        textbeeResponse = JSON.parse(responseText);
      } catch (e) {
        textbeeResponse = { raw: responseText };
      }

      if (res.ok) {
        isSuccess = true;
        statusText = "sent";
      } else {
        console.error("TextBee API Error:", responseText);
      }
    } catch (apiError: any) {
      console.error("TextBee Fetch Error (Could be CORS):", apiError);
      textbeeResponse = { error: apiError.message || String(apiError) };
      
      // If it's a CORS error or network error, let's try via a CORS proxy as a fallback
      try {
        console.log("Attempting fallback via CORS proxy...");
        const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(textbeeUrl)}`;
        const fallbackRes = await fetch(proxyUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": settings.api_key,
          },
          body: JSON.stringify({
            recipients: [cleanPhone],
            message: message,
          }),
        });
        
        const fallbackText = await fallbackRes.text();
        try {
          textbeeResponse = JSON.parse(fallbackText);
        } catch(e) {
          textbeeResponse = { raw: fallbackText };
        }
        
        if (fallbackRes.ok) {
          isSuccess = true;
          statusText = "sent";
        }
      } catch (fallbackError: any) {
        console.error("Fallback also failed:", fallbackError);
        textbeeResponse = { originalError: textbeeResponse, fallbackError: fallbackError.message };
      }
    }

    // 5. Update Log
    if (logId) {
      await supabase
        .from("sms_logs")
        .update({
          status: statusText,
          provider_response: textbeeResponse,
        })
        .eq("id", logId);
    }

    return { success: isSuccess, status: statusText, response: textbeeResponse };
  } catch (err: any) {
    console.error("Error in sendDirectSms:", err);
    return { success: false, error: err.message };
  }
}
