// API Route per Vercel: /api/pair-display
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const body = await req.json();
    const { pairing_code, user_id } = body;

    if (!pairing_code || !user_id) {
      return new Response(
        JSON.stringify({ error: "Missing pairing_code or user_id" }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceKey || !supabaseUrl) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Trova il display con questo pairing code
    const { data: display, error: fetchError } = await supabase
      .from("displays")
      .select("*")
      .eq("pairing_code", pairing_code.toUpperCase())
      .maybeSingle();

    if (fetchError || !display) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid pairing code",
          details: "No display found with this pairing code"
        }), 
        { 
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Verifica che il display non sia già associato
    if (display.user_id && display.user_id !== user_id) {
      return new Response(
        JSON.stringify({ 
          error: "Display already paired",
          details: "This display is already associated with another account"
        }), 
        { 
          status: 409,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Associa il display all'utente e rimuovi il pairing code
    const { error: updateError } = await supabase
      .from("displays")
      .update({ 
        user_id,
        pairing_code: null,
        status: "online",
        updated_at: new Date().toISOString()
      })
      .eq("id", display.id);

    if (updateError) {
      console.error("Error pairing display:", updateError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to pair display",
          details: updateError.message
        }), 
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    console.log(`Display ${display.id} paired with user ${user_id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        display: {
          id: display.id,
          name: display.name || `Display ${pairing_code}`,
          status: "online"
        }
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Unexpected error in pair-display:", error);
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