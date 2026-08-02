# Firebase Phone OTP login (Brijwasi Car Bazaar app)

## App flow

1. **Login (default):** Enter mobile → OTP → login  
2. **New user:** After OTP → **email only** screen → home  
3. **Secondary:** “Login with email instead” → email + password (existing accounts)

## Firebase Console (required)

1. [Firebase Console](https://console.firebase.google.com) → project **brijwasicar**
2. **Authentication** → **Sign-in method**
3. Enable **Phone**
4. (Recommended) Add **test phone numbers** while developing to avoid SMS quota

### Android

1. **Project settings** → Your Android app (`com.dtcarbazaar.dt_car_bazaar`)
2. Add **SHA-1** and **SHA-256** from your signing key:

```bash
cd mobile/android
./gradlew signingReport
```

3. Download updated `google-services.json` → `mobile/android/app/` (or run `scripts/apply-firebase-android.sh`)

### iOS (when you ship iOS)

1. Enable Phone provider (same as above)
2. Upload APNs key in Firebase for silent verification (optional but recommended)

## Backend (Render)

Deploy latest `main` so these routes exist:

- `POST /api/auth/firebase/phone/login`
- `POST /api/auth/firebase/phone/complete`

Existing Firebase Admin env on Render must stay set (`FIREBASE_SERVICE_ACCOUNT_BASE64`, `FIREBASE_PROJECT_ID`).

## Billing note

Phone Auth SMS may require **Firebase Blaze (pay-as-you-go)** plan for production volume. Test numbers work on free tier for QA.

## Troubleshooting

| Issue | Check |
|--------|--------|
| OTP not received | Phone enabled in Firebase; correct SHA-1 on Android; real device (not all emulators receive SMS) |
| Invalid OTP | 6-digit code; request resend after 45s |
| After OTP, email screen | Expected for **first-time** users only |
| Email login | Only for accounts created with email/password before |
