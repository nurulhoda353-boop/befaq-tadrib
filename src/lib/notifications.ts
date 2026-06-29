import { supabase } from "@/integrations/supabase/client";

/**
 * Sends notifications (SMS via TextBee, etc.) when a registration is confirmed.
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
    const message = `অভিনন্দন ${name}!\n"${eventTitle}"-এ আপনার রেজিস্ট্রেশন সফলভাবে কনফার্ম হয়েছে।\nআপনার রেজিস্ট্রেশন আইডি: ${reg.registration_id}`;

    console.log("Triggering SMS Edge Function for:", phone);

    // 4. Call Supabase Edge Function to securely send SMS via TextBee
    const { data, error } = await supabase.functions.invoke('send-sms', {
      body: { phone_number: phone, message }
    });

    if (error) {
      console.error("SMS Edge Function Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Unexpected error in sendConfirmationDetails:", err);
    return { success: false, error: err.message };
  }
}
