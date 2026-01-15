import { createClient } from "@supabase/supabase-js";

// Client per operazioni lato server con Service Role Key (Admin)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Helper per verificare se le tabelle esistono (solo debug)
export async function checkTables() {
  const { data, error } = await supabaseAdmin
    .from('displays')
    .select('id')
    .limit(1);
  
  return { exists: !error, error };
}
