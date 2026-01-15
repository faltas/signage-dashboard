(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/supabaseClient.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createSupabaseBrowserClient",
    ()=>createSupabaseBrowserClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-client] (ecmascript)");
;
function createSupabaseBrowserClient() {
    const supabaseUrl = ("TURBOPACK compile-time value", "https://etllfcxshlkmjblavssu.supabase.co");
    const supabaseKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0bGxmY3hzaGxrbWpibGF2c3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NDc3ODQsImV4cCI6MjA4MjQyMzc4NH0.12ULpJSy5vKkn78mlUJX4CXp72f9cVf2iQLhn_nsOQ4");
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createBrowserClient"])(supabaseUrl, supabaseKey);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/providers.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SupabaseProvider",
    ()=>SupabaseProvider,
    "useSupabase",
    ()=>useSupabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabaseClient.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
const SupabaseContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function SupabaseProvider({ children }) {
    _s();
    // Use a state that starts as undefined to avoid hydration mismatch
    const [supabase, setSupabase] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(undefined);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SupabaseProvider.useEffect": ()=>{
            const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSupabaseBrowserClient"])();
            if (client) {
                setSupabase(client);
            } else {
                setSupabase(null);
            }
        }
    }["SupabaseProvider.useEffect"], []);
    // While initializing, return a loading state or the children if you handle null in hooks
    if (supabase === undefined) return null;
    if (supabase === null) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "glass-premium p-10 rounded-[2.5rem] max-w-md space-y-6 border-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.1)]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-8 h-8 text-rose-400",
                            fill: "none",
                            viewBox: "0 0 24 24",
                            stroke: "currentColor",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: 2,
                                d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            }, void 0, false, {
                                fileName: "[project]/app/providers.jsx",
                                lineNumber: 30,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/providers.jsx",
                            lineNumber: 29,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/providers.jsx",
                        lineNumber: 28,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-black text-foreground tracking-tighter",
                        children: "Connection Required"
                    }, void 0, false, {
                        fileName: "[project]/app/providers.jsx",
                        lineNumber: 33,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-muted-foreground font-medium",
                        children: [
                            "Please configure your ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-primary",
                                children: "Supabase credentials"
                            }, void 0, false, {
                                fileName: "[project]/app/providers.jsx",
                                lineNumber: 34,
                                columnNumber: 82
                            }, this),
                            " in the Replit Secrets tab to enable cloud orchestration."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/providers.jsx",
                        lineNumber: 34,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pt-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4",
                                children: "Missing variables:"
                            }, void 0, false, {
                                fileName: "[project]/app/providers.jsx",
                                lineNumber: 36,
                                columnNumber: 14
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap justify-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        className: "px-3 py-1 bg-white/5 rounded-lg text-[10px] text-rose-300 border border-white/5",
                                        children: "NEXT_PUBLIC_SUPABASE_URL"
                                    }, void 0, false, {
                                        fileName: "[project]/app/providers.jsx",
                                        lineNumber: 38,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                        className: "px-3 py-1 bg-white/5 rounded-lg text-[10px] text-rose-300 border border-white/5",
                                        children: "NEXT_PUBLIC_SUPABASE_ANON_KEY"
                                    }, void 0, false, {
                                        fileName: "[project]/app/providers.jsx",
                                        lineNumber: 39,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/providers.jsx",
                                lineNumber: 37,
                                columnNumber: 14
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/providers.jsx",
                        lineNumber: 35,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/providers.jsx",
                lineNumber: 27,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/providers.jsx",
            lineNumber: 26,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SupabaseContext.Provider, {
        value: supabase,
        children: children
    }, void 0, false, {
        fileName: "[project]/app/providers.jsx",
        lineNumber: 48,
        columnNumber: 5
    }, this);
}
_s(SupabaseProvider, "TRAmXAD/DAo15l7hyx2G6mjnodk=");
_c = SupabaseProvider;
function useSupabase() {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SupabaseContext);
}
_s1(useSupabase, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
var _c;
__turbopack_context__.k.register(_c, "SupabaseProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/language-provider.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LanguageProvider",
    ()=>LanguageProvider,
    "useLanguage",
    ()=>useLanguage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
const LanguageContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
const translations = {
    it: {
        // Navigazione
        fleet_nodes: "PLAYERS",
        sequences: "PLAYLIST",
        media_vault: "CONTENUTI",
        control_panel: "IMPOSTAZIONI",
        walls: "VIDEO WALL",
        // Auth
        terminate_session: "TERMINA SESSIONE",
        logout_system: "ESCI",
        login: "ACCEDI",
        email: "Email",
        password: "Password",
        login_button: "Accedi al Sistema",
        // Status
        node_sync_active: "Sincronizzazione Attiva",
        system_account: "Account Sistema",
        secure_os: "Sicuro v1.0",
        online: "Online",
        offline: "Offline",
        // Dashboard
        overview: "Panoramica",
        network_management: "Gestione Rete Digital Signage",
        network_fleet: "Flotta Players",
        real_time_status: "Stato in tempo reale dei tuoi display.",
        // Display Management
        register_node: "REGISTRA DISPLAY",
        register_node_desc: "Inizializza un nuovo display nella rete.",
        fleet_empty: "Nessun Player",
        fleet_empty_desc: "Non ci sono Player attivi. Registra il tuo primo Player per iniziare.",
        syncing: "SINCRONIZZAZIONE...",
        pairing_code: "Codice Pairing",
        pair_display: "Associa Player",
        pairing_success: "Player associato con successo!",
        pairing_error: "Errore durante l'associazione",
        enter_pairing_code: "Inserisci il codice mostrato sul display",
        scan_qr: "Scansiona QR",
        or_enter_code: "oppure inserisci il codice manualmente",
        last_seen_at: "Ultimo contatto",
        display_no_name: "Player senza nome",
        // Display Details
        display_name: "Nome Display",
        display_status: "Stato",
        last_seen: "Ultimo Contatto",
        assigned_playlist: "Playlist Assegnata",
        assign_playlist: "Assegna Playlist",
        no_playlist: "Nessuna Playlist",
        wall_configuration: "Configurazione Wall",
        screens: "Schermi",
        resolution: "Risoluzione",
        // Walls
        video_walls: "Video Wall",
        led_walls: "LED Wall",
        multi_screen_config: "Configurazioni Multi-Schermo",
        create_wall: "Crea Wall",
        wall_name: "Nome Wall",
        wall_type: "Tipo Wall",
        videowall: "Video Wall",
        ledwall: "LED Wall",
        canvas_width: "Larghezza Canvas (px)",
        canvas_height: "Altezza Canvas (px)",
        rows: "Righe",
        columns: "Colonne",
        total_screens: "Schermi Totali",
        grid_layout: "Layout Griglia",
        no_walls: "Nessun Wall Configurato",
        create_first_wall: "Crea la tua prima configurazione video wall o LED wall",
        // Content
        directories: "Directory",
        new_directory_name: "Nome nuova directory...",
        create: "CREA",
        back_to_root: "Torna alla Root",
        deploy_asset: "CARICA CONTENUTO",
        upload_content: "Carica Contenuto",
        search_assets: "Cerca contenuti...",
        root: "Root",
        storage: "Archiviazione",
        no_content: "Nessun Contenuto",
        upload_first: "Carica il tuo primo contenuto per iniziare",
        // Playlists
        new_sequence: "Nuova Playlist",
        define_orchestration: "Definisci la tua sequenza di contenuti.",
        sequence_name: "Nome Playlist",
        description: "Descrizione",
        no_playlists: "Nessuna Playlist",
        create_now: "CREA ORA",
        manage_sequence: "GESTISCI PLAYLIST",
        objects: "Elementi",
        length: "Durata",
        total_playtime: "Durata Totale",
        objects_count: "Elementi",
        inject_asset: "AGGIUNGI CONTENUTO",
        orchestration_timeline: "Timeline Playlist",
        drag_reorder: "TRASCINA PER RIORDINARE",
        timeline_empty: "TIMELINE VUOTA - AGGIUNGI CONTENUTO",
        search_playlist: "Cerca playlist...",
        default_playlist_descr: "Nessuna descrizione",
        mgnt_playlist: "MODIFICA PLAYLIST",
        count_contents: "CONTENUTI",
        lenght_playlist: "DURATA",
        // Playlist ids
        back_to_sequences: "Torna a lista playlist",
        live_node_simulator: "Simulatore display",
        transmitting: "In riproduzione",
        remaining: "Tempo rimanente",
        sequence_pos: "Sequenza",
        // Commands
        remote_commands: "Comandi Remoti",
        refresh: "Aggiorna",
        reload_playlist: "Ricarica Playlist",
        restart_display: "Riavvia Display",
        set_brightness: "Imposta Luminosità",
        set_resolution: "Imposta Risoluzione",
        // Monitoring
        health_monitoring: "Monitoraggio Salute",
        cpu_usage: "Uso CPU",
        memory_usage: "Uso Memoria",
        temperature: "Temperatura",
        brightness: "Luminosità",
        uptime: "Uptime",
        network_status: "Stato Rete",
        // Settings
        control_panel_title: "Pannello di Controllo",
        system_admin_protocols: "Amministrazione Sistema",
        settings_title: "Impostazioni",
        database_synced: "Database Sincronizzato",
        connected_supabase: "Connesso al cluster Supabase.",
        optimize_storage: "OTTIMIZZA ARCHIVIAZIONE",
        security_audit: "Audit Sicurezza",
        last_scan: "Ultima scansione: 2 minuti fa.",
        run_full_scan: "ESEGUI SCANSIONE",
        language: "Lingua",
        // Common
        cancel: "ANNULLA",
        create_btn: "CREA",
        save: "SALVA",
        delete: "ELIMINA",
        edit: "MODIFICA",
        back: "Indietro",
        confirm: "CONFERMA",
        close: "CHIUDI",
        loading: "Caricamento...",
        error: "Errore",
        success: "Successo",
        // Time
        seconds: "secondi",
        minutes: "minuti",
        hours: "ore",
        days: "giorni",
        sec: "SEC",
        // Days
        mon: "LUN",
        tue: "MAR",
        wed: "MER",
        thu: "GIO",
        fri: "VEN",
        sat: "SAB",
        sun: "DOM",
        // Advanced
        advanced_settings: "Impostazioni Avanzate",
        advanced_scheduling: "Scheduling Avanzato",
        active_days: "Giorni Attivi",
        time_slots: "Fasce Orarie",
        add_slot: "AGGIUNGI FASCIA",
        save_scheduling: "SALVA SCHEDULING",
        transmission_timing: "Timing Trasmissione",
        set_active_duration: "Imposta la durata per questo contenuto.",
        seconds_loop: "Secondi per ciclo"
    },
    en: {
        // Navigation
        fleet_nodes: "PLAYERS",
        sequences: "PLAYLISTS",
        media_vault: "CONTENTS",
        control_panel: "SETTINGS",
        walls: "VIDEO WALLS",
        // Auth
        terminate_session: "TERMINATE SESSION",
        logout_system: "LOGOUT",
        login: "LOGIN",
        email: "Email",
        password: "Password",
        login_button: "Login to System",
        // Status
        node_sync_active: "Sync Active",
        system_account: "System Account",
        secure_os: "Secure v1.0",
        online: "Online",
        offline: "Offline",
        // Dashboard
        overview: "Overview",
        network_management: "Digital Signage Network Management",
        network_fleet: "Players Fleet",
        real_time_status: "Real-time status of your displays.",
        // Display Management
        register_node: "REGISTER DISPLAY",
        register_node_desc: "Initialize a new display in the network.",
        fleet_empty: "No Players",
        fleet_empty_desc: "No active players found. Register your first player to begin.",
        syncing: "SYNCING...",
        pairing_code: "Pairing Code",
        pair_display: "Pair Player",
        pairing_success: "Player paired successfully!",
        pairing_error: "Error during pairing",
        enter_pairing_code: "Enter the code shown on the display",
        scan_qr: "Scan QR",
        or_enter_code: "or enter code manually",
        last_seen_at: "Last signal",
        display_no_name: "Player without name",
        // Display Details
        display_name: "Display Name",
        display_status: "Status",
        last_seen: "Last Seen",
        assigned_playlist: "Assigned Playlist",
        assign_playlist: "Assign Playlist",
        no_playlist: "No Playlist",
        wall_configuration: "Wall Configuration",
        screens: "Screens",
        resolution: "Resolution",
        // Walls
        video_walls: "Video Walls",
        led_walls: "LED Walls",
        multi_screen_config: "Multi-Screen Configurations",
        create_wall: "Create Wall",
        wall_name: "Wall Name",
        wall_type: "Wall Type",
        videowall: "Video Wall",
        ledwall: "LED Wall",
        canvas_width: "Canvas Width (px)",
        canvas_height: "Canvas Height (px)",
        rows: "Rows",
        columns: "Columns",
        total_screens: "Total Screens",
        grid_layout: "Grid Layout",
        no_walls: "No Walls Configured",
        create_first_wall: "Create your first video wall or LED wall configuration",
        // Content
        directories: "Directories",
        new_directory_name: "New directory name...",
        create: "CREATE",
        back_to_root: "Back to Root",
        deploy_asset: "UPLOAD CONTENT",
        upload_content: "Upload Content",
        search_assets: "Search content...",
        root: "Root",
        storage: "Storage",
        no_content: "No Content",
        upload_first: "Upload your first content to begin",
        // Playlists
        new_sequence: "New Playlist",
        define_orchestration: "Define your content sequence.",
        sequence_name: "Playlist Name",
        description: "Description",
        no_playlists: "No Playlists",
        create_now: "CREATE NOW",
        manage_sequence: "MANAGE PLAYLIST",
        objects: "Items",
        length: "Duration",
        total_playtime: "Total Playtime",
        objects_count: "Items",
        inject_asset: "ADD CONTENT",
        orchestration_timeline: "Playlist Timeline",
        drag_reorder: "DRAG TO REORDER",
        timeline_empty: "TIMELINE EMPTY - ADD CONTENT",
        search_playlist: "Search sequences...",
        default_playlist_descr: "No description available",
        mgnt_playlist: "MANAGE PLAYLIST",
        count_contents: "CONTENTS",
        lenght_playlist: "LENGHT",
        //playlist id
        back_to_sequences: "Back to playlists",
        live_node_simulator: "Display simulator",
        transmitting: "Transmitting",
        remaining: "Remaining",
        sequence_pos: "Sequence",
        // Commands
        remote_commands: "Remote Commands",
        refresh: "Refresh",
        reload_playlist: "Reload Playlist",
        restart_display: "Restart Display",
        set_brightness: "Set Brightness",
        set_resolution: "Set Resolution",
        // Monitoring
        health_monitoring: "Health Monitoring",
        cpu_usage: "CPU Usage",
        memory_usage: "Memory Usage",
        temperature: "Temperature",
        brightness: "Brightness",
        uptime: "Uptime",
        network_status: "Network Status",
        // Settings
        control_panel_title: "Control Panel",
        system_admin_protocols: "System Administration",
        settings_title: "Settings",
        database_synced: "Database Synced",
        connected_supabase: "Connected to Supabase cluster.",
        optimize_storage: "OPTIMIZE STORAGE",
        security_audit: "Security Audit",
        last_scan: "Last scan: 2 minutes ago.",
        run_full_scan: "RUN SCAN",
        language: "Language",
        // Common
        cancel: "CANCEL",
        create_btn: "CREATE",
        save: "SAVE",
        delete: "DELETE",
        edit: "EDIT",
        back: "Back",
        confirm: "CONFIRM",
        close: "CLOSE",
        loading: "Loading...",
        error: "Error",
        success: "Success",
        // Time
        seconds: "seconds",
        minutes: "minutes",
        hours: "hours",
        days: "days",
        sec: "SEC",
        // Days
        mon: "MON",
        tue: "TUE",
        wed: "WED",
        thu: "THU",
        fri: "FRI",
        sat: "SAT",
        sun: "SUN",
        // Advanced
        advanced_settings: "Advanced Settings",
        advanced_scheduling: "Advanced Scheduling",
        active_days: "Active Days",
        time_slots: "Time Slots",
        add_slot: "ADD SLOT",
        save_scheduling: "SAVE SCHEDULING",
        transmission_timing: "Transmission Timing",
        set_active_duration: "Set the duration for this content.",
        seconds_loop: "Seconds per loop"
    }
};
function LanguageProvider({ children }) {
    _s();
    const [lang, setLang] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("it"); // Default Italiano
    const [isClient, setIsClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LanguageProvider.useEffect": ()=>{
            setIsClient(true);
            const saved = localStorage.getItem("app_lang");
            if (saved && (saved === "it" || saved === "en")) {
                setLang(saved);
            }
        }
    }["LanguageProvider.useEffect"], []);
    const switchLanguage = (newLang)=>{
        if (newLang === "it" || newLang === "en") {
            setLang(newLang);
            if (isClient) {
                localStorage.setItem("app_lang", newLang);
            }
        }
    };
    const t = (key)=>translations[lang]?.[key] || key;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LanguageContext.Provider, {
        value: {
            lang,
            switchLanguage,
            t,
            isClient
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/app/language-provider.jsx",
        lineNumber: 404,
        columnNumber: 5
    }, this);
}
_s(LanguageProvider, "d3esMcAgXjGj2FM6NOzSuKfml4E=");
_c = LanguageProvider;
function useLanguage() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(LanguageContext);
    if (!context) throw new Error("useLanguage must be used within LanguageProvider");
    return context;
}
_s1(useLanguage, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "LanguageProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_e190d41e._.js.map