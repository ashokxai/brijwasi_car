# DT Car Bazaar

Used car marketplace:
- `mobile/` — Flutter customer app
- `backend/` — Node.js + Express + MongoDB + JWT
- `admin/` — React + Vite + Ant Design admin panel

**Call / WhatsApp:** +91 863 093 0402

---

## Status

| Phase | Scope | Status |
|-------|--------|--------|
| 1 | Setup, Auth, Backend, DB | Done |
| 2 | Home, Search, Details, Favorites | Done |
| 3 | Sell Car, Image Upload, Approval | Done |
| 4 | Admin Dashboard + CRUD | Done |
| 5 | Polish, banners, share, deploy packaging | Done |

---

## Quick start (local)

```bash
# MongoDB
brew services start mongodb/brew/mongodb-community@7.0

# Backend
cd backend
cp .env.example .env
npm install
npm run seed
npm run seed:cars
npm run dev          # http://localhost:5050

# Admin
cd admin
cp .env.example .env
npm install
npm run dev          # http://localhost:5173

# Mobile (Android emulator)
export PATH="$HOME/Projects/flutter/bin:$PATH"
cd mobile
flutter pub get
flutter run -d emulator-5554 --dart-define=API_BASE_URL=http://10.0.2.2:5050/api
```

**Admin:** `admin@dtcarbazaar.com` / `Admin@123`

---

## Docker (API + Admin + Mongo)

```bash
docker compose up --build -d
```

- API: http://localhost:5050  
- Admin: http://localhost:8080  
- Mongo: localhost:27017  

Then seed once:

```bash
docker compose exec backend node src/seed.js
docker compose exec backend node src/seedCars.js
```

---

## Hosting (same repo, different hosts)

This monorepo deploys in **3 separate places**:

| Folder | What it is | Host |
|--------|------------|------|
| `admin/` | React admin website | [Vercel](https://vercel.com) |
| `backend/` | Node API + uploads | [Render](https://render.com) / Railway / Fly.io |
| `mobile/` | Flutter Android/iOS app | Google Play / App Store |

Repo: https://github.com/ashokxai/brijwasi_car

### 1) Database — MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user + allow network access (`0.0.0.0/0` for simple start)
3. Copy connection string, e.g. `mongodb+srv://user:pass@cluster/.../dt_car_bazaar`

### 2) API — Render

Option A — Blueprint: use root `render.yaml` in the Render dashboard.

Option B — Manual:
1. New **Web Service** → connect `ashokxai/brijwasi_car`
2. **Root Directory:** `backend`
3. Build: `npm install` · Start: `npm start`
4. Set env vars from `backend/.env.example` (at least `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `CORS_ORIGINS`, `NODE_ENV=production`)
5. After deploy, note your API URL, e.g. `https://dt-car-bazaar-api.onrender.com`
6. Seed once (Render shell or one-off job):

```bash
npm run seed
npm run seed:cars
```

Health check: `GET /api/health`

> Uploaded images on free Render disk can reset. For production, move to Cloudinary/S3 later.

### 3) Admin website — Vercel

1. Import `ashokxai/brijwasi_car` on [Vercel](https://vercel.com)
2. **Root Directory:** `admin` (important)
3. Framework: Vite · Build: `npm run build` · Output: `dist`
4. Environment variable:
   - `VITE_API_URL` = `https://YOUR-API.onrender.com/api`
5. Deploy → you get e.g. `https://brijwasi-car.vercel.app`
6. Put that URL into Render as `CLIENT_URL` and `CORS_ORIGINS`

`admin/vercel.json` already handles React Router SPA rewrites.

### 4) Flutter app — stores (not Vercel)

```bash
cd mobile
flutter build apk --dart-define=API_BASE_URL=https://YOUR-API.onrender.com/api
# or
flutter build appbundle --dart-define=API_BASE_URL=https://YOUR-API.onrender.com/api
```

Upload the APK/AAB to Google Play (and IPA to App Store when ready).

### Env checklist

**Render (backend)**
- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL` = Vercel URL
- `CORS_ORIGINS` = Vercel URL (comma-separated if multiple)
- `NODE_ENV=production`

**Vercel (admin)**
- `VITE_API_URL` = `https://...onrender.com/api`

**Mobile**
- `--dart-define=API_BASE_URL=https://...onrender.com/api`

---

## Features

### Customer app
- Auth (login / register / forgot-password help)
- Home banners + listings + filters
- Car details with **Car Key**, share, Call / WhatsApp (WhatsApp includes car details)
- Favorites, notifications, my listings
- Sell car (camera + gallery, 3–10 photos) → pending until admin approval

### Admin
- Dashboard, car approve/reject/delete + detail drawer
- Search by **Car Key** / title
- Add car with photos
- Users, brands, models, cities, fuel types
- Banner image upload
- Reports + settings

---

## Car Key

Every listing gets a unique key like `DT-2026-00011` for admin search and WhatsApp inquiries.
