"use client";

import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext(null);

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
    seconds_loop: "Secondi per ciclo",
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
    seconds_loop: "Seconds per loop",
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("it"); // Default Italiano
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("app_lang");
    if (saved && (saved === "it" || saved === "en")) {
      setLang(saved);
    }
  }, []);

  const switchLanguage = (newLang) => {
    if (newLang === "it" || newLang === "en") {
      setLang(newLang);
      if (isClient) {
        localStorage.setItem("app_lang", newLang);
      }
    }
  };

  const t = (key) => translations[lang]?.[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, switchLanguage, t, isClient }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}