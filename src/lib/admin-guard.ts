import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export async function ensureAdmin() {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) throw redirect({ to: "/auth" });
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", uid)
    .eq("role", "admin");
  if (!roles || roles.length === 0) {
    throw redirect({ to: "/" });
  }
}
