const {
  initializeApp,
  getApps,
  cert,
  applicationDefault,
} = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

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
  if (
    (text.startsWith("'") && text.endsWith("'")) ||
    (text.startsWith('"') && text.endsWith('"'))
  ) {
    text = text.slice(1, -1);
  }
  return JSON.parse(text);
}

function initFirebase() {
  if (initialized) return true;
  if (initError) return false;

  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (
    !process.env.FIREBASE_SERVICE_ACCOUNT_JSON &&
    !process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 &&
    !process.env.GOOGLE_APPLICATION_CREDENTIALS
  ) {
    console.warn(
      'Firebase Admin not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON (or FIREBASE_SERVICE_ACCOUNT_BASE64) on Render.'
    );
    return false;
  }

  try {
    if (getApps().length === 0) {
      if (
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
        process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
      ) {
        const serviceAccount = parseServiceAccount();
        if (!serviceAccount) {
          throw new Error('Service account JSON is empty');
        }
        initializeApp({
          credential: cert(serviceAccount),
          projectId: projectId || serviceAccount.project_id,
        });
      } else {
        initializeApp({
          credential: applicationDefault(),
          projectId,
        });
      }
    }
    initialized = true;
    console.log('Firebase Admin initialized');
    return true;
  } catch (err) {
    initError = err;
    console.error('Firebase Admin init failed:', err.message);
    return false;
  }
}

async function verifyIdToken(idToken) {
  const ok = initFirebase();
  if (!ok) {
    const detail = initError?.message ? ` (${initError.message})` : '';
    const err = new Error(
      `Firebase Auth is not configured on the server${detail}. Add FIREBASE_SERVICE_ACCOUNT_BASE64 on Render and redeploy.`
    );
    err.statusCode = 503;
    throw err;
  }
  return getAuth().verifyIdToken(idToken);
}

module.exports = { initFirebase, verifyIdToken };
