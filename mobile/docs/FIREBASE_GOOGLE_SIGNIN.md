# Google Sign-In + Phone OTP (Brijwasi Car Bazaar)

## App login order

1. **Primary:** Continue with Google  
2. **Secondary:** Mobile number → OTP  
3. **Tertiary:** Email + password (existing accounts)

## Firebase Console setup (required)

Project: **`brijwasi-car-prod`** (`113559261780`)

### 1. Project settings (name & support email)

Firebase Console → ⚙️ Project settings → **General**

- **Public-facing name:** e.g. `Brijwasi Car Bazaar` (not `project-113559261780`)
- **Support email:** an email you monitor (e.g. `asisodia156@gmail.com` or `anuragtripathi600@gmail.com`)

### 2. Enable Google sign-in

1. **Authentication** → **Sign-in method** → **Google** → Enable → Save  
2. Copy the **Web client ID** shown there (needed for Android `idToken`)

### 3. Add SHA fingerprints (required for Google + Phone on Android)

App: `com.dtcarbazaar.dt_car_bazaar`

Current release/debug keystore fingerprints:

```
SHA-1:   F7:88:41:2C:1A:B7:C7:C3:D0:B3:D5:F1:48:A8:74:92:F5:15:5C:32
SHA-256: 98:9A:57:B8:DA:8A:03:6D:F9:41:63:1C:3D:26:99:61:B6:16:46:C7:79:AD:C3:E1:D8:8A:D0:FC:3C:22:B4:B0
```

Project settings → Your apps → Android app → Add fingerprint → Save  
Then download a fresh `google-services.json` and apply:

```bash
bash scripts/apply-firebase-android.sh ~/Downloads/google-services.json
```

### 4. Build with Web client ID

```bash
cd mobile
flutter build apk --release \
  --dart-define=API_BASE_URL=https://dt-car-bazaar-api.onrender.com/api \
  --dart-define=GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

### 5. Backend

Redeploy API so Google users are auto-created via `POST /api/auth/firebase/login`.

Ensure Render has:

- `FIREBASE_PROJECT_ID=brijwasi-car-prod`
- `FIREBASE_SERVICE_ACCOUNT_BASE64=...` (for that project)

## Phone OTP

Keep **Phone** provider enabled + India SMS region as before.
