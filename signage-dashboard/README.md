# Digital Signage Player 🎥

**Professional Electron-based digital signage player for Macropix and BrightSign systems**

Version: 1.0.0

---

## 📋 Overview

This is a production-ready digital signage player built with Electron, designed for professional installations with multi-monitor support, video walls, offline capabilities, and real-time content management.

### Key Features

✅ **Multi-Monitor Support** - Native support for multiple displays and video walls  
✅ **Offline Mode** - Continues playback even without internet connection  
✅ **Real-time Updates** - Instant content updates via Supabase real-time  
✅ **Health Monitoring** - System metrics, temperature, and performance monitoring  
✅ **Remote Commands** - Control brightness, resolution, and content remotely  
✅ **QR Code Pairing** - Easy device pairing with management panel  
✅ **Content Caching** - Smart local caching for improved performance  
✅ **Playlist Scheduling** - Campaign-based content scheduling  
✅ **Scene Support** - Complex multi-region scene layouts  

---

## 🏗️ Architecture

```
digital-signage-player/
├── main/                    # Electron main process
│   └── main.cjs            # Window management, IPC handlers
│
├── preload/                 # Secure bridge layer
│   ├── preload.cjs         # Context bridge APIs
│   ├── config.cjs          # Configuration management
│   ├── env.cjs             # Environment loader
│   └── supabaseClient.cjs  # Supabase initialization
│
└── renderer/                # Renderer process (UI)
    ├── app.js              # Application entry point
    ├── index.html          # Main HTML template
    ├── core/               # Core engine
    │   ├── PlayerEngine.js # Main player orchestration
    │   └── PlayerState.js  # State management
    ├── services/           # Business logic modules
    │   ├── DisplayManager.js
    │   ├── PlaylistManager.js
    │   ├── HealthManager.js
    │   ├── CommandManager.js
    │   └── ...
    ├── render/             # Rendering components
    │   ├── RenderEngine.js
    │   ├── VirtualCanvas.js
    │   └── components/
    ├── cache/              # Asset caching
    ├── offline/            # Offline support
    └── utils/              # Utilities
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Electron** 27.x (included in dependencies)

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd digital-signage-player
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Configure environment**

Edit `preload/env.json` with your backend and Supabase credentials:

```json
{
  "BACKEND_URL": "https://your-backend.com",
  "DISPLAY_TOKEN": "https://your-backend.com/api/display-token",
  "REGISTER_DISPLAY_TOKEN": "https://your-backend.com/api/register-display",
  "SUPABASE_LINK": "https://your-project.supabase.co",
  "ANON_KEY": "your-anon-key",
  "HEARBEAT_MS": 30000
}
```

4. **Run in development mode**
```bash
npm start
```

5. **Build for production**
```bash
npm run build
```

This creates distributables in the `dist/` folder for your platform.

---

## ⚙️ Configuration

### Display Pairing

On first launch, the player will:
1. Register with the backend
2. Display a QR code and pairing code
3. Wait for pairing confirmation from the management panel

### Player Configuration (`preload/player-config.json`)

```json
{
  "displayId": null,
  "pairingCode": null,
  "cacheEnabled": true,
  "offlineMode": false
}
```

This file is auto-managed by the player.

---

## 📊 Features in Detail

### Multi-Monitor & Video Walls

The player automatically detects all connected displays and syncs with the backend configuration. Supports:
- Physical screen mapping
- Virtual canvas projection
- Custom resolution and orientation per screen

### Offline Robustness

When the backend is unavailable:
- Loads cached playlist from localStorage
- Uses locally cached media files
- Periodically retries backend connection
- Seamlessly resumes online mode when available

### Real-time Updates

Via Supabase realtime channels:
- Playlist content changes
- Display configuration updates
- Remote commands execution
- Health monitoring

### Remote Commands

Supported commands:
- `reload_playlist` - Reload content
- `force_scene` - Display specific scene
- `set_brightness` - Adjust display brightness
- `set_resolution` - Change display resolution
- `restart` - Restart player

---

## 🧪 Testing

Run the test suite:

```bash
node tests/run-tests.js
```

Tests cover:
- ✅ Module imports and dependencies
- ✅ Core services initialization
- ✅ Configuration management
- ✅ Error handling and recovery
- ✅ Offline mode functionality

---

## 🔧 Development

### Code Structure

The codebase follows a **modular architecture** with clear separation of concerns:

- **Managers** (DisplayManager, PlaylistManager, etc.) - Handle business logic
- **Services** - Provide specific functionality (caching, API calls, etc.)
- **Components** - Render UI elements
- **Utils** - Shared utilities and helpers

### Key Design Principles

1. **Modularity** - Each module has a single responsibility
2. **Error Resilience** - Comprehensive error handling and recovery
3. **Scalability** - Easy to add new features and content types
4. **Performance** - Asset preloading and smooth transitions
5. **Maintainability** - Clean code with consistent patterns

---

## 📦 Building for Production

### Windows
```bash
npm run build
```
Generates: `dist/digital-signage-player Setup X.X.X.exe`

### Linux
```bash
npm run build
```
Generates: `dist/digital-signage-player-X.X.X.AppImage`

### Configuration for Build

Edit `electron-builder.yml` for custom build settings:
- Application name and version
- Target platforms
- Installer configuration
- Auto-update settings

---

## 🛠️ Troubleshooting

### Player doesn't show pairing code
- Check that `window.QR` is available (QRCode library loaded)
- Verify backend is reachable at `REGISTER_DISPLAY_TOKEN` URL
- Check browser console for errors

### Content not playing
- Verify playlist is assigned to the display in management panel
- Check that campaign schedule is active
- Inspect cache: `~/DigitalSignageCache/contents/`

### Offline mode not working
- Ensure content was cached during online session
- Check localStorage for cached playlist
- Verify media files exist in cache directory

### Performance issues
- Reduce content resolution for large video walls
- Enable hardware acceleration in Electron
- Increase cache size if needed

---

## 📝 API Reference

### PlayerEngine

```javascript
const engine = createPlayerEngine(env, config, setPlayerContent);
await engine.init();              // Initialize player
await engine.reloadPlaylist();   // Reload current playlist
await engine.forceScene(sceneId); // Force display scene
```

### DisplayManager

```javascript
const displayManager = new DisplayManager(env, config);
await displayManager.registerIfNeeded();
const info = await displayManager.getDisplayInfo();
await displayManager.syncScreens(displayInfo);
```

---

## 🤝 Contributing

This is a professional commercial player. For feature requests or bug reports, please contact the development team.

---

## 📄 License

Proprietary - All rights reserved

---

## 📞 Support

For technical support or questions:
- Email: support@yourcompany.com
- Documentation: https://docs.yourcompany.com

---

## 🔄 Changelog

### Version 1.0.0 (Current)
- ✅ Modular refactored architecture
- ✅ Fixed pairing screen QR code display
- ✅ Enhanced error handling and recovery
- ✅ Optimized PlayerEngine for scalability
- ✅ Added comprehensive service managers
- ✅ Improved offline mode robustness
- ✅ Professional code documentation

---

Built with ❤️ for professional digital signage installations