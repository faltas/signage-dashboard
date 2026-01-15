const { createClient } = require("@supabase/supabase-js");

let supabase = null;

function initSupabase(url, anonKey, token) {
  supabase = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {}
    }
	
  });
  
  if (token) 
	 supabase.realtime.setAuth(token); 

  return supabase;
}

function getSupabase() {
  return supabase;
}

module.exports = { initSupabase, getSupabase };
