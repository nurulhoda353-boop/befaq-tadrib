import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth" });
    }
    
    // Fetch role and permissions
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role, permissions")
      .eq("user_id", data.user.id)
      .single();
      
    return { 
      user: data.user, 
      role: roles?.role || 'viewer',
      permissions: roles?.permissions || []
    };
  },
  component: () => <Outlet />,
});
