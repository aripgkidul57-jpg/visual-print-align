import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { if (active) setLoading(false); return; }
      const { data: ok } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
      if (active) { setIsAdmin(Boolean(ok)); setLoading(false); }
    });
    return () => { active = false; };
  }, []);
  return { isAdmin, loading };
}
