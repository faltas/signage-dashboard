# Digital Signage Player 🎮

**Professional Electron-based player for digital signage displays**

Version: 1.0.0 | Electron 27 + Supabase

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Connection to Dashboard

Edit `preload/env.json`:

```json
{
  "BACKEND_URL": "https://your-dashboard.vercel.app",
  "REGISTER_DISPLAY_TOKEN": "https://your-dashboard.vercel.app/api/register-display",
  "DISPLAY_TOKEN": "https://your-dashboard.vercel.app/api/display-token",
  "SUPABASE_LINK": "https://etllfcxshlkmjblavssu.supabase.co",
  "ANON_KEY": "your_anon_key",
  "HEARBEAT_MS": 30000
}
```

### 3. Run Player

```bash
npm start
```

The player will:
1. Register with the dashboard
2. Show QR code + pairing code
3. Wait for pairing from dashboard
4. Start playing content after pairing

---

## 📦 Build for Production

### Build All Platforms

```bash
npm run build
```

Output in `dist/`:
- Windows: `.exe` installer
- Linux: `.AppImage`
- macOS: `.dmg`

### Build Specific Platform

```bash
npm run build:win    # Windows
npm run build:linux  # Linux
npm run build:mac    # macOS
```

---

## 🏗️ Architecture

```
├── main/
│   └── main.cjs           # Electron main process
├── preload/
│   ├── preload.cjs        # Secure bridge
│   ├── env.json           # Configuration
│   └── config.cjs         # Config management
├── renderer/
│   ├── app.js             # Entry point
│   ├── index.html         # Main HTML
│   ├── core/              # Core engine
│   │   ├── PlayerEngine.js
│   │   └── PlayerState.js
│   ├── services/          # Business logic
│   │   ├── DisplayManager.js
│   │   ├── PlaylistManager.js
│   │   ├── HealthManager.js
│   │   └── CommandManager.js
│   ├── render/            # Rendering engine
│   ├── cache/             # Asset caching
│   ├── offline/           # Offline support
│   └── utils/             # Utilities
├── tests/                # Test suite
├── scripts/              # Build scripts
└── package.json
```

---

## 🎯 Features

### Core Features
- ✅ **QR Code Pairing** - Easy setup
- ✅ **Multi-Monitor** - Video wall support
- ✅ **Offline Mode** - Works without internet
- ✅ **Real-time Updates** - Live content changes
- ✅ **Health Monitoring** - System metrics
- ✅ **Remote Commands** - Control from dashboard

### Display Types
- ✅ Single Display
- ✅ Video Wall (multiple monitors)
- ✅ LED Wall (single large display)

### Content Types
- ✅ Images (JPG, PNG, WebP)
- ✅ Videos (MP4, WebM)
- ✅ Scenes (multi-region layouts)

---

## ⚙️ Configuration

### Environment (`preload/env.json`)

| Key | Description | Required |
|-----|-------------|----------|
| `BACKEND_URL` | Dashboard base URL | ✅ |
| `REGISTER_DISPLAY_TOKEN` | Registration endpoint | ✅ |
| `DISPLAY_TOKEN` | Auth endpoint | ✅ |
| `SUPABASE_LINK` | Supabase project URL | ✅ |
| `ANON_KEY` | Supabase anon key | ✅ |
| `HEARBEAT_MS` | Health check interval | ✅ |

### Player Config (`preload/player-config.json`)

Auto-generated after first run:
```json
{
  "displayId": "uuid",
  "pairingCode": null
}
```

---

## 🔄 Pairing Flow

1. **Player starts** → No `displayId` saved
2. **Calls** `/api/register-display`
3. **Shows** QR code + 4-digit code (e.g., A3F9)
4. **User** opens dashboard → "Pair Display"
5. **Enters** code A3F9
6. **Display** paired ✅
7. **Player** starts receiving content

---

## 🧪 Testing

### Run All Tests

```bash
node tests/run-tests.cjs
```

Expected: **32/32 tests passing** ✅

### Test Pairing

```bash
node tests/pairing-test.cjs
```

Expected: **14/14 tests passing** ✅

### Validate Build

```bash
node scripts/validate-build.cjs
```

Expected: **All validations passed** ✅

---

## 🐛 Troubleshooting

### Player doesn't show pairing code

- Check `preload/env.json` is configured
- Verify dashboard URL is reachable
- Check browser console for errors

### Content not playing

- Verify playlist is assigned in dashboard
- Check campaign schedule is active
- Inspect cache: `~/DigitalSignageCache/contents/`

### Offline mode not working

- Ensure content was cached during online session
- Check localStorage for cached playlist
- Verify media files exist in cache directory

### Display shows as offline in dashboard

- Check internet connection
- Verify dashboard URL in `env.json`
- Look at logs: View → Toggle Developer Tools

---

## 📚 Documentation

- **Complete Guide**: See `README.md`
- **Architecture**: Modular design with managers
- **Testing**: 100% test coverage

---

## 🔗 Related

- **Dashboard Repository**: [github.com/faltas/signage-dashboard](https://github.com/faltas/signage-dashboard)

---

## 📝 License

Proprietary - All rights reserved

---

**Built with ❤️ for professional digital signage installations**