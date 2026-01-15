// API Route per Vercel: /api/display-token
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const body = await req.json();
    const { displayId } = body;

    if (!displayId) {
      return new Response(
        JSON.stringify({ error: "Missing displayId parameter" }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const secret = process.env.SUPABASE_JWT_SECRET;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!secret || !serviceKey || !supabaseUrl) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Verifica che il display esista
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: display, error: fetchError } = await supabase
      .from("displays")
      .select("id, status, pairing_code")
      .eq("id", displayId)
      .maybeSingle();

    if (fetchError || !display) {
      console.error("Display not found:", displayId);
      return new Response(
        JSON.stringify({ 
          error: "Display not found",
          details: "The specified display ID does not exist"
        }), 
        { 
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Aggiorna last_seen_at
    await supabase
      .from("displays")
      .update({ 
        last_seen_at: new Date().toISOString(),
        status: "online"
      })
      .eq("id", displayId);

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

    console.log(`Token generated for display: ${displayId}`);

    return new Response(
      JSON.stringify({ token }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Unexpected error in display-token:", error);
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