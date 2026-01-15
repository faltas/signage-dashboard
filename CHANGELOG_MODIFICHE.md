# Modifiche Digital Signage - Changelog

## Data: $(date)

### 1. ✅ FIX: Playlist senza Scheduling
**File modificati:**
- `/app/renderer/services/playlistService.js`
- `/app/PLAYER/renderer/services/playlistService.js`

**Problema:** La playlist non veniva caricata se non c'era una campagna schedulata.

**Soluzione:** Ora il sistema:
1. Prima cerca campagne attive (scheduling)
2. Se non ci sono campagne, carica la playlist assegnata direttamente al display (`displays.playlist_id`)

---

### 2. ✅ FIX: Bug WaitingScreen dopo Pairing
**File modificati:**
- `/app/renderer/core/PlayerEngine.js`
- `/app/PLAYER/renderer/core/PlayerEngine.js`

**Problema:** Dopo il pairing mostrava "Offline - No Cache" anche se il player era online.

**Soluzione:** 
- **Offline senza cache** → Errore "Offline - No Cache Content Available"
- **Online senza playlist** → WaitingScreen con messaggio di attesa contenuti

---

### 3. ✅ NUOVO: Componenti Dashboard Mancanti
**File creati:**
- `/app/DASHBOARD/components/dashboard/StatsHud.jsx`
- `/app/DASHBOARD/components/dashboard/DisplayGrid.jsx`
- `/app/DASHBOARD/components/dashboard/DisplayViewSwitcher.jsx`

---

### 4. ✅ NUOVO: Pagina Gestione Walls
**File creati:**
- `/app/DASHBOARD/app/walls/page.jsx`

**File aggiornati:**
- `/app/DASHBOARD/components/walls/WallManager.jsx` (completamente riscritto)
- `/app/DASHBOARD/components/Sidebar.jsx` (aggiunta voce menu "Video Walls")

**Funzionalità:**
- Creazione/modifica/eliminazione Video Wall e LED Wall
- Anteprima griglia schermi
- Associazione display ai wall
- Link rapidi ai display associati

---

### 5. ✅ MIGLIORATA: Pagina Dettaglio Display
**File aggiornato:**
- `/app/DASHBOARD/app/displays/[id]/page.jsx` (completamente riscritto)

**Nuove funzionalità:**
- Visualizzazione info display con status online/offline
- Gestione playlist principale del display
- Elenco schermi (display_screens) raggruppati sotto il display
- Playlist dedicata per singolo schermo (video wall)
- Comandi remoti per display e singoli schermi
- Nota per video wall sulla priorità playlist

---

### 6. ✅ MIGLIORATA: DisplayCard
**File aggiornato:**
- `/app/DASHBOARD/app/displays/components/DisplayCard.jsx`

**Nuove info mostrate:**
- Nome wall associato (se presente)
- Numero schermi
- Nome playlist assegnata
- Status pairing migliorato

---

### 7. ✅ NUOVO: Opzione "Espandi su tutti gli schermi"
**File aggiornati:**
- `/app/DASHBOARD/app/playlists/[id]/page.jsx`
- `/app/preload/preload.cjs`
- `/app/PLAYER/preload/preload.cjs`

**Funzionalità:**
- Checkbox "Espandi su tutti gli schermi" quando si aggiunge un contenuto alla playlist
- Il contenuto marcato verrà mostrato su tutti gli schermi del video wall come un unico grande schermo

---

### 8. ✅ Schema Database
**File aggiornati:**
- `/app/DASHBOARD/supabase/schema.sql`

**File creati:**
- `/app/DASHBOARD/supabase/migrations/001_add_playlist_to_screens.sql`

**Nuove colonne:**
- `display_screens.playlist_id` - playlist per singolo schermo
- `playlist_items.expand_to_all_screens` - flag per espansione video wall

---

### 9. ✅ Hooks e API
**File aggiornati:**
- `/app/DASHBOARD/app/displays/hooks/useDisplays.js` - ora include playlists, walls, screens
- `/app/preload/preload.cjs` - nuova API `fetchScreensWithPlaylists`
- `/app/PLAYER/preload/preload.cjs` - stessa API aggiunta

---

## ⚠️ AZIONE RICHIESTA: Eseguire Migrazione Database

Per abilitare le nuove funzionalità, esegui la migrazione SQL in Supabase:

```sql
-- 1. Add playlist_id to display_screens
ALTER TABLE display_screens
ADD COLUMN IF NOT EXISTS playlist_id UUID REFERENCES playlists(id) ON DELETE SET NULL;

-- 2. Add expand_to_all_screens to playlist_items
ALTER TABLE playlist_items
ADD COLUMN IF NOT EXISTS expand_to_all_screens BOOLEAN DEFAULT FALSE;

-- 3. Create index
CREATE INDEX IF NOT EXISTS idx_display_screens_playlist_id 
ON display_screens(playlist_id) WHERE playlist_id IS NOT NULL;
```

Oppure esegui il file: `/app/DASHBOARD/supabase/migrations/001_add_playlist_to_screens.sql`

---

## Come funziona ora il sistema:

### Player Logic:
1. **Con Scheduling:** Carica playlist dalla campagna attiva
2. **Senza Scheduling:** Carica playlist assegnata direttamente al display
3. **Nessuna playlist + Online:** Mostra WaitingScreen
4. **Nessuna playlist + Offline:** Mostra errore cache

### Video Wall:
1. **Playlist su Display:** Contenuto espanso su tutti gli schermi
2. **Playlist su Screen:** Contenuto diverso per ogni schermo
3. **Flag expand_to_all_screens:** Decide se espandere su tutti gli schermi nel video wall

### Dashboard:
1. **Displays:** Lista player con schermi raggruppati
2. **Walls:** Configurazione video wall/LED wall
3. **Display Detail:** Gestione playlist per display e singoli schermi
