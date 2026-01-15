# 🚀 Git Push Instructions - Dashboard

## Quick Push to GitHub

```bash
# 1. Navigate to dashboard folder
cd /app/DASHBOARD_CLEAN

# 2. Initialize git
git init

# 3. Add remote repository
git remote add origin https://github.com/faltas/signage-dashboard.git

# 4. Add all files
git add .

# 5. Check what will be committed (make sure .env.local is NOT included)
git status

# 6. Commit
git commit -m "feat: Professional dashboard v1.0.0

✅ Next.js 16 + Supabase + Vercel ready
✅ Complete display management
✅ QR code pairing flow
✅ Multi-language support (IT/EN)
✅ Real-time updates
✅ Video wall support
✅ Professional UI/UX
✅ Production ready"

# 7. Push to GitHub
git branch -M main
git push -u origin main

# 8. Create version tag
git tag -a v1.0.0 -m "Release v1.0.0 - Professional Dashboard"
git push origin v1.0.0
```

## ✅ Pre-Push Checklist

```bash
# Verify .env.local is NOT included
git status | grep .env.local
# Should show nothing ✅

# Verify .env.local.example IS included
ls -la .env.local.example
# Should exist ✅

# Test build
npm install
npm run build
# Should complete without errors ✅
```

## 🚀 After Push - Deploy to Vercel

1. Go to https://vercel.com/new
2. Import from GitHub: `signage-dashboard`
3. Framework: Next.js (auto-detect)
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_JWT_SECRET`
5. Deploy ✅

## 📝 Notes

- Make sure all environment variables are set on Vercel
- After deploy, run `supabase/schema.sql` in Supabase SQL Editor
- Test the pairing flow with the player

---

**Repository:** https://github.com/faltas/signage-dashboard