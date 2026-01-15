// API Route per Vercel: /api/register-display
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const body = await req.json();
    const { deviceInfo } = body;

    const secret = process.env.SUPABASE_JWT_SECRET;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Validazione env vars
    if (!secret || !serviceKey || !supabaseUrl) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ 
          error: "Server configuration error",
          details: "Missing required environment variables"
        }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Crea client Supabase con service role
    const supabase = createClient(supabaseUrl, serviceKey);

    // Genera pairing code unico (4 caratteri alfanumerici)
    let pairing_code;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      pairing_code = Math.random().toString(36).substring(2, 6).toUpperCase();
      const { data } = await supabase
        .from("displays")
        .select("id")
        .eq("pairing_code", pairing_code)
        .maybeSingle();
      
      if (!data) break;
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return new Response(
        JSON.stringify({ error: "Failed to generate unique pairing code" }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Inserisci il display
    const { data: inserted, error: insertError } = await supabase
      .from("displays")
      .insert({
        pairing_code,
        status: "offline",
        last_seen_at: new Date().toISOString(),
        hardware_id: deviceInfo?.hardware_id || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting display:", insertError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to register display",
          details: insertError.message
        }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const displayId = inserted.id;

    // Genera JWT per questo display
    const now = Math.floor(Date.now() / 1000);
    const token = jwt.sign(
      {
        role: "authenticated",
        is_display: true,
        display_id: displayId,
        iat: now - 120, // Retrodatato per clock drift
      },
      secret,
      {
        expiresIn: "365d", // 1 anno
      }
    );

    console.log(`Display registered successfully: ${displayId} with pairing code: ${pairing_code}`);

    // Risposta al player
    return new Response(
      JSON.stringify({
        displayId,
        pairing_code,
        token,
      }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Unexpected error in register-display:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error.message
      }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}