import jwt from "jsonwebtoken";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function POST(req) {
  const body = await req.json();
  const { displayId } = body;

  if (!displayId) {
    return new Response(JSON.stringify({ error: "Missing displayId" }), {
      status: 400,
    });
  }

  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    return new Response(
      JSON.stringify({ error: "Missing SUPABASE_JWT_SECRET" }),
      { status: 500 }
    );
  }

  console.log("SECRET USED BY DISPLAY-TOKEN:", secret);

  // Retrodata di 120 secondi per evitare problemi di clock drift
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

  return new Response(JSON.stringify({ token }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
