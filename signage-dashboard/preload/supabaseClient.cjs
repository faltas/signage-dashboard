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
        ? { "x-player-token": token }
        : {}
    },
  });

  return supabase;
}

function getSupabase() {
  return supabase;
}

module.exports = { initSupabase, getSupabase };
