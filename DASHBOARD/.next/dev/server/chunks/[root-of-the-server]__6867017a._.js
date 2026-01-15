module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/api/pair-display/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// API Route per Vercel: /api/pair-display
__turbopack_context__.s([
    "POST",
    ()=>POST,
    "dynamic",
    ()=>dynamic,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
const runtime = "nodejs";
const dynamic = "force-dynamic";
;
async function POST(req) {
    try {
        const body = await req.json();
        const { pairing_code, user_id } = body;
        if (!pairing_code || !user_id) {
            return new Response(JSON.stringify({
                error: "Missing pairing_code or user_id"
            }), {
                status: 400,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = ("TURBOPACK compile-time value", "https://etllfcxshlkmjblavssu.supabase.co");
        if (!serviceKey || !supabaseUrl) {
            return new Response(JSON.stringify({
                error: "Server configuration error"
            }), {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, serviceKey);
        // Trova il display con questo pairing code
        const { data: display, error: fetchError } = await supabase.from("displays").select("*").eq("pairing_code", pairing_code.toUpperCase()).maybeSingle();
        if (fetchError || !display) {
            return new Response(JSON.stringify({
                error: "Invalid pairing code",
                details: "No display found with this pairing code"
            }), {
                status: 404,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }
        // Verifica che il display non sia già associato
        if (display.user_id && display.user_id !== user_id) {
            return new Response(JSON.stringify({
                error: "Display already paired",
                details: "This display is already associated with another account"
            }), {
                status: 409,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }
        // Associa il display all'utente e rimuovi il pairing code
        const { error: updateError } = await supabase.from("displays").update({
            user_id,
            pairing_code: null,
            status: "online",
            updated_at: new Date().toISOString()
        }).eq("id", display.id);
        if (updateError) {
            console.error("Error pairing display:", updateError);
            return new Response(JSON.stringify({
                error: "Failed to pair display",
                details: updateError.message
            }), {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            });
        }
        console.log(`Display ${display.id} paired with user ${user_id}`);
        return new Response(JSON.stringify({
            success: true,
            display: {
                id: display.id,
                name: display.name || `Display ${pairing_code}`,
                status: "online"
            }
        }), {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        });
    } catch (error) {
        console.error("Unexpected error in pair-display:", error);
        return new Response(JSON.stringify({
            error: "Internal server error",
            details: error.message
        }), {
            status: 500,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6867017a._.js.map