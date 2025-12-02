import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, collection } from 'firebase/firestore';

// Firebase configuration - you'll replace these values with your own
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Check if Firebase is configured
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "" && firebaseConfig.projectId !== "";
};

// Initialize Firebase only if configured
let app: ReturnType<typeof initializeApp> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

export { db, doc, setDoc, onSnapshot, collection };

// Helper to save data to Firestore
export async function saveToFirestore<T>(collectionName: string, docId: string, data: T): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, collectionName, docId), { data, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error(`Error saving ${collectionName}:`, error);
  }
}

// Helper to subscribe to Firestore updates
export function subscribeToFirestore<T>(
  collectionName: string,
  docId: string,
  callback: (data: T | null) => void
): () => void {
  if (!db) {
    callback(null);
    return () => {};
  }

  return onSnapshot(
    doc(db, collectionName, docId),
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data().data as T);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error(`Error subscribing to ${collectionName}:`, error);
      callback(null);
    }
  );
}
