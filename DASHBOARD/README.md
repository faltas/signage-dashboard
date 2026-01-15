# Digital Signage Dashboard 🎛️

**Professional Next.js dashboard for managing digital signage displays**

Version: 1.0.0 | Next.js 16 + Supabase + Vercel

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://etllfcxshlkmjblavssu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
```

### 3. Setup Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open SQL Editor
3. Copy contents of `supabase/schema.sql`
4. Run the query
5. ✅ All tables created!

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📦 Deploy to Vercel

### Via GitHub (Recommended)

1. Push to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import repository
4. Add environment variables
5. Deploy ✅

### Via CLI

```bash
npm i -g vercel
vercel
```

---

## 🏗️ Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── register-display/
│   │   ├── display-token/
│   │   └── pair-display/
│   ├── displays/         # Display management
│   ├── playlists/        # Playlist management
│   ├── contents/         # Content upload
│   └── settings/         # Settings
├── components/
│   ├── ui/               # UI components (shadcn)
│   ├── dashboard/        # Dashboard components
│   └── walls/            # Video/LED wall management
├── lib/
│   ├── supabaseClient.js
│   └── supabaseAdmin.js
├── supabase/
│   └── schema.sql        # Database schema
├── public/               # Static assets
└── package.json
```

---

## 🎯 Features

- ✅ Display Management (single/multi)
- ✅ QR Code Pairing
- ✅ Real-time Status Updates
- ✅ Playlist Management
- ✅ Content Upload & Storage
- ✅ Video Wall Support
- ✅ LED Wall Support
- ✅ Health Monitoring
- ✅ Remote Commands
- ✅ Multi-language (IT/EN)
- ✅ Responsive Design
- ✅ Dark Mode

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (backend) | ✅ |
| `SUPABASE_JWT_SECRET` | JWT secret for signing tokens | ✅ |

### Get JWT Secret

1. Go to Supabase Dashboard
2. Settings → API
3. Copy "JWT Secret"

---

## 📡 API Endpoints

### `POST /api/register-display`

Register a new display

**Request:**
```json
{ "deviceInfo": {} }
```

**Response:**
```json
{
  "displayId": "uuid",
  "pairing_code": "A3F9",
  "token": "jwt-token"
}
```

### `POST /api/display-token`

Get authentication token

**Request:**
```json
{ "displayId": "uuid" }
```

**Response:**
```json
{ "token": "jwt-token" }
```

### `POST /api/pair-display`

Pair display to user

**Request:**
```json
{
  "pairing_code": "A3F9",
  "user_id": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "display": { ... }
}
```

---

## 🧪 Testing

```bash
# Test build
npm run build

# Test locally
npm start
```

---

## 🐛 Troubleshooting

### Build fails on Vercel

- Check `vercel.json` exists
- Verify all env vars are set
- Try: Deployments → Redeploy (no cache)

### Database connection fails

- Verify Supabase URL and keys
- Check RLS policies are enabled
- Run `supabase/schema.sql` again

### Pairing not working

- Check API routes are deployed
- Verify JWT_SECRET is set
- Test API with curl:
  ```bash
  curl https://your-app.vercel.app/api/register-display -X POST -d '{"deviceInfo":{}}'
  ```

---

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)

---

## 🔗 Related

- **Player Repository**: [github.com/girgis-web/Player](https://github.com/girgis-web/Player)

---

## 📝 License

Proprietary - All rights reserved

---

**Built with ❤️ for professional digital signage**