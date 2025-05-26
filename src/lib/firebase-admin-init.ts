import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

function initializeFirebaseAdmin() {
  console.log('[Firebase Admin] Starting initialization...');

  try {
    // Check required environment variables
    const requiredEnvVars = {
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    };

    console.log('[Firebase Admin] Environment variables status:', {
      projectId: !!process.env.FIREBASE_PROJECT_ID,
      clientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      storageBucket: !!process.env.FIREBASE_STORAGE_BUCKET
    });

    // Check for missing environment variables
    const missingVars = Object.entries(requiredEnvVars)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    if (!getApps().length) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
      console.log('[Firebase Admin] Private key format check:', {
        length: privateKey.length,
        startsWithDashes: privateKey.startsWith('-----'),
        containsNewlines: privateKey.includes('\\n'),
      });

      const config = {
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      };

      console.log('[Firebase Admin] Initializing with config:', {
        projectId: process.env.FIREBASE_PROJECT_ID,
        hasPrivateKey: !!privateKey,
        storageBucket: config.storageBucket,
      });

      admin.initializeApp(config);
      console.log('[Firebase Admin] Initialized successfully');
    } else {
      console.log('[Firebase Admin] Already initialized');
    }

    return {
      adminDb: admin.firestore(),
      adminStorage: admin.storage(),
      adminAuth: admin.auth(),
    };
  } catch (error) {
    console.error('[Firebase Admin] Initialization error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

// Initialize Firebase Admin and export the services
const { adminDb, adminStorage, adminAuth } = initializeFirebaseAdmin();
export { adminDb, adminStorage, adminAuth }; 