# 🚀 Git Push Instructions - Player

## Quick Push to GitHub

```bash
# 1. Navigate to player folder
cd /app/PLAYER_CLEAN

# 2. Initialize git
git init

# 3. Add remote repository
git remote add origin https://github.com/girgis-web/Player.git

# 4. Add all files
git add .

# 5. Check what will be committed
git status

# 6. Commit
git commit -m "feat: Professional player v1.0.0

✅ Modular architecture (DisplayManager, PlaylistManager, etc.)
✅ Fixed pairing QR code
✅ 100% test coverage (46/46 tests)
✅ Offline mode support
✅ Real-time updates
✅ Video/LED wall support
✅ Professional documentation
✅ Production ready"

# 7. Push to GitHub
git branch -M main
git push -u origin main

# 8. Create version tag
git tag -a v1.0.0 -m "Release v1.0.0 - Professional Player"
git push origin v1.0.0
```

## ✅ Pre-Push Checklist

```bash
# Run tests
node tests/run-tests.cjs
# Should show: 32/32 tests passing ✅

node tests/pairing-test.cjs
# Should show: 14/14 tests passing ✅

node scripts/validate-build.cjs
# Should show: All validations passed ✅
```

## 📦 After Push - Build & Distribute

```bash
# Build for production
npm run build

# Distribute to displays
# Windows: dist/digital-signage-player Setup X.X.X.exe
# Linux: dist/digital-signage-player-X.X.X.AppImage
# macOS: dist/digital-signage-player-X.X.X.dmg
```

## ⚙️ Configuration

Before distributing, update `preload/env.json` with your dashboard URL:

```json
{
  "BACKEND_URL": "https://your-dashboard.vercel.app",
  "REGISTER_DISPLAY_TOKEN": "https://your-dashboard.vercel.app/api/register-display",
  "DISPLAY_TOKEN": "https://your-dashboard.vercel.app/api/display-token"
}
```

---

**Repository:** https://github.com/girgis-web/Player