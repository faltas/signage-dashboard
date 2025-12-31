import jwt from "jsonwebtoken";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function POST(req) {
  const body = await req.json();
  const { deviceInfo } = body; // opzionale

  const secret = process.env.SUPABASE_JWT_SECRET;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  console.log("SECRET USED BY REGISTER-DISPLAY:", secret);

  if (!secret || !serviceKey || !supabaseUrl) {
    return new Response(JSON.stringify({ error: "Missing env vars" }), {
      status: 500,
    });
  }

  // 1. Crea client Supabase con service role (solo backend!)
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey);

  // 2. Genera pairing code unico
  let pairing_code;
  while (true) {
    pairing_code = Math.random().toString(36).substring(2, 6).toUpperCase();
    const { data } = await supabase
      .from("displays")
      .select("id")
      .eq("pairing_code", pairing_code)
      .maybeSingle();
    if (!data) break;
  }

  // 3. Inserisci il display
  const { data: inserted, error } = await supabase
    .from("displays")
    .insert({
      pairing_code,
      name: "Display-" + pairing_code,
      status: "mgmt",
      last_seen_at: new Date().toISOString(),
      playlist_id: null,
    })
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  const displayId = inserted.id;

  // 4. Genera JWT per questo display
  const now = Math.floor(Date.now() / 1000);

  const token = jwt.sign(
    {
      role: "authenticated",
      is_display: true,
      display_id: displayId,
      iat: now - 120, // <-- retrodatato di 120 secondi
    },
    secret,
    {
      expiresIn: "24h",
    }
  );

  // 5. Rispondi al player
  return new Response(
    JSON.stringify({
      displayId,
      pairing_code,
      token,
    }),
    { status: 200 }
  );
}
