import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import type { Firestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';
import type { FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Log config values (without sensitive data)
console.log('Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket,
  hasApiKey: !!firebaseConfig.apiKey,
  hasAppId: !!firebaseConfig.appId
});

let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;

// Initialize Firebase
try {
  // Check if Firebase is already initialized
  if (!getApps().length) {
    console.log('Initializing new Firebase instance...');
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    console.log('Firebase initialized successfully');
  } else {
    console.log('Using existing Firebase instance');
    const app = getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export { db, auth, storage }; 