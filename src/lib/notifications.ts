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
      .select("registration_id, form_data, event_id, events(title, confirmation_sms_template)")
      .eq("id", regId)
      .single();

    if (fetchErr || !reg) {
      console.error("Failed to fetch registration for notification:", fetchErr);
      return { success: false, error: "Registration not found" };
    }

    // 2. Extract phone number and name from form_data
    const formData = (reg.form_data as Record<string, any>) || {};
    const keys = Object.keys(formData);
    const phoneKey = keys.find((k) => k.toLowerCase().includes("মোবাইল") || k.toLowerCase().includes("ফোন") || k.toLowerCase().includes("phone") || k.toLowerCase().includes("mobile"));
    const phone = phoneKey ? formData[phoneKey] : null;
    
    const nameKey = keys.find((k) => k.toLowerCase().includes("নাম") || k.toLowerCase().includes("name"));
    let name = nameKey ? formData[nameKey] : "অংশগ্রহণকারী";

    if (!phone) {
      console.log("No phone number found in form data for SMS. Skipping.");
      return { success: false, error: "No phone number found" };
    }

    // 3. Construct SMS Message (use custom template if available)
    const eventTitle = (reg.events as any)?.title || "ইভেন্ট";
    const customTemplate = (reg.events as any)?.confirmation_sms_template;
    
    let message: string;
    if (customTemplate) {
      // Replace variables in custom template
      message = customTemplate
        .replace(/\{name\}/g, name)
        .replace(/\{event\}/g, eventTitle)
        .replace(/\{id\}/g, reg.registration_id || "");
    } else {
      // Default message
      message = `অভিনন্দন ${name}!\n"${eventTitle}"-এ আপনার রেজিস্ট্রেশন সফলভাবে কনফার্ম হয়েছে।\nআপনার আইডি: ${reg.registration_id}`;
    }

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
    const { data, error } = await supabase.functions.invoke("send-sms", {
      body: { phone_number: phone, message }
    });
    
    if (error) {
      console.error("SMS Edge Function Error:", error);
      return { success: false, error: error.message };
    }
    
    if (!data.success) {
      return { success: false, error: data.error || "Failed to send SMS" };
    }
    
    return { success: true };
  } catch (err: any) {
    console.error("SMS Error:", err);
    return { success: false, error: err.message };
  }
}
