# 🎮 PLAYER - Digital Signage Player

## 📍 Repository GitHub

**Nome suggerito**: `signage-player` o `digital-signage-player`

**Repository URL**: https://github.com/girgis-web/Player

---

## 📁 Files da includere nel Player Repository

### Struttura Player (da `/app/`):

```
Player/
├── main/
│   └── main.cjs
├── preload/
│   ├── preload.cjs
│   ├── config.cjs
│   ├── env.cjs
│   ├── env.json
│   ├── player-config.json
│   └── supabaseClient.cjs
├── renderer/
│   ├── index.html
│   ├── app.js
│   ├── core/
│   │   ├── PlayerEngine.js
│   │   └── PlayerState.js
│   ├── services/
│   │   ├── DisplayManager.js
│   │   ├── PlaylistManager.js
│   │   ├── HealthManager.js
│   │   ├── CommandManager.js
│   │   ├── displayService.js
│   │   ├── playlistService.js
│   │   ├── healthService.js
│   │   ├── heartbeatService.js
│   │   ├── commandService.js
│   │   ├── screenService.js
│   │   ├── schedulingService.js
│   │   ├── mappingService.js
│   │   └── realtimeService.js
│   ├── render/
│   │   ├── RenderEngine.js
│   │   ├── VirtualCanvas.js
│   │   ├── SceneRenderer.js
│   │   ├── applyScreenMask.js
│   │   ├── fitMode.js
│   │   └── components/
│   │       ├── ScreenComponents.js
│   │       ├── ImageRenderer.js
│   │       └── VideoRenderer.js
│   ├── cache/
│   │   ├── assetCache.js
│   │   └── preloader.js
│   ├── offline/
│   │   ├── offlineGuard.js
│   │   └── cacheService.js
│   └── utils/
│       ├── logger.js
│       └── matchPhysicalToLogicalDisplays.js
├── tests/
│   ├── run-tests.cjs
│   └── pairing-test.cjs
├── scripts/
│   └── validate-build.cjs
├── package.json
├── package-lock.json
├── electron-builder.yml
├── README.md
├── CHANGELOG.md
├── IMPROVEMENTS.md
└── .gitignore
```

---

## 🚀 Comandi per Push su GitHub

### Prima volta (nuovo repository):

```bash
cd /app

# Inizializza git (se non già fatto)
git init

# Aggiungi remote
git remote add origin https://github.com/girgis-web/Player.git

# Aggiungi solo i file del player
git add main/ preload/ renderer/ tests/ scripts/
git add package.json package-lock.json electron-builder.yml
git add README.md CHANGELOG.md IMPROVEMENTS.md
git add .gitignore

# Commit
git commit -m "feat: Professional player refactored - v1.0.0

- Modular architecture (DisplayManager, PlaylistManager, etc.)
- Fixed pairing QR code bug
- 100% test coverage (46/46 tests)
- Production-ready"

# Push
git branch -M main
git push -u origin main
```

### Aggiornamento repository esistente:

```bash
cd /app

# Pull latest
git pull origin main

# Aggiungi modifiche
git add .

# Commit
git commit -m "refactor: Modular architecture and bug fixes"

# Push
git push origin main
```

---

## 📝 .gitignore per Player

```gitignore
# Dependencies
node_modules/

# Build outputs
dist/
build/

# Electron
out/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Cache
.cache/
*.cache

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Environment
.env
.env.local

# Player specific
DigitalSignageCache/
preload/player-config.json
```

---

## 📋 Checklist Pre-Push

- [ ] Tutti i test passano: `node tests/run-tests.cjs`
- [ ] Pairing test OK: `node tests/pairing-test.cjs`
- [ ] Validazione build: `node scripts/validate-build.cjs`
- [ ] README aggiornato con ultima versione
- [ ] CHANGELOG aggiornato con modifiche
- [ ] Nessun file sensibile (API keys, tokens)
- [ ] .gitignore configurato correttamente

---

## 🏷️ Tag Version

```bash
# Crea tag per release
git tag -a v1.0.0 -m "Release v1.0.0 - Professional Player"
git push origin v1.0.0
```

---

## 📦 Files da NON includere

❌ **NON includere nel Player repo**:
- `/app/dashboard/` (va nel repo Dashboard separato)
- `/app/frontend/` (se esiste)
- `/app/backend/` (se esiste)
- File con credenziali o API keys
- Cache o build artifacts

---

## ✅ Repository Pronto!

Una volta fatto il push, il repository Player sarà:
- ✅ Completo e funzionante
- ✅ Professionale e modulare
- ✅ Testato (46/46 test)
- ✅ Documentato
- ✅ Pronto per essere venduto
