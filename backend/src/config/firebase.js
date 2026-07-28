const admin = require('firebase-admin');

let initialized = false;
let initError = null;

function parseServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (b64 && String(b64).trim()) {
    const decoded = Buffer.from(String(b64).trim(), 'base64').toString('utf8');
    return JSON.parse(decoded);
  }

  if (!raw || !String(raw).trim()) return null;

  let text = String(raw).trim();
  // Remove wrapping quotes if pasted with them in Render UI
  if (
    (text.startsWith("'") && text.endsWith("'")) ||
    (text.startsWith('"') && text.endsWith('"'))
  ) {
    text = text.slice(1, -1);
  }
  return JSON.parse(text);
}

function initFirebase() {
  if (initialized) return admin;
  if (initError) return null;

  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (
    !process.env.FIREBASE_SERVICE_ACCOUNT_JSON &&
    !process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 &&
    !process.env.GOOGLE_APPLICATION_CREDENTIALS
  ) {
    console.warn(
      'Firebase Admin not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON (or FIREBASE_SERVICE_ACCOUNT_BASE64) on Render.'
    );
    return null;
  }

  try {
    if (
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
    ) {
      const cred = parseServiceAccount();
      if (!cred) {
        throw new Error('Service account JSON is empty');
      }
      admin.initializeApp({
        credential: admin.credential.cert(cred),
        projectId: projectId || cred.project_id,
      });
    } else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId,
      });
    }
    initialized = true;
    console.log('Firebase Admin initialized');
    return admin;
  } catch (err) {
    initError = err;
    console.error('Firebase Admin init failed:', err.message);
    return null;
  }
}

async function verifyIdToken(idToken) {
  const app = initFirebase();
  if (!app) {
    const detail = initError?.message ? ` (${initError.message})` : '';
    const err = new Error(
      `Firebase Auth is not configured on the server${detail}. Add FIREBASE_SERVICE_ACCOUNT_JSON on Render and redeploy.`
    );
    err.statusCode = 503;
    throw err;
  }
  return app.auth().verifyIdToken(idToken);
}

module.exports = { initFirebase, verifyIdToken };
