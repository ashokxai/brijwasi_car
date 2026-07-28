const admin = require('firebase-admin');

let initialized = false;

function initFirebase() {
  if (initialized) return admin;

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!json && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.warn(
      'Firebase Admin not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON (or GOOGLE_APPLICATION_CREDENTIALS).'
    );
    return null;
  }

  try {
    if (json) {
      const cred = JSON.parse(json);
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
    console.error('Firebase Admin init failed:', err.message);
    return null;
  }
}

async function verifyIdToken(idToken) {
  const app = initFirebase();
  if (!app) {
    const err = new Error('Firebase Auth is not configured on the server');
    err.statusCode = 503;
    throw err;
  }
  return app.auth().verifyIdToken(idToken);
}

module.exports = { initFirebase, verifyIdToken };
