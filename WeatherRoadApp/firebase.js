import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';

// Gauti konfigūraciją iš app.config.js
const config = Constants.expoConfig?.extra || {};

console.log('🔧 Firebase konfigūracija:', {
  projectId: config.FIREBASE_PROJECT_ID,
  hasApiKey: !!config.FIREBASE_API_KEY,
  hasAuthDomain: !!config.FIREBASE_AUTH_DOMAIN,
});

const firebaseConfig = {
  apiKey: config.FIREBASE_API_KEY,
  authDomain: config.FIREBASE_AUTH_DOMAIN,
  projectId: config.FIREBASE_PROJECT_ID,
  storageBucket: config.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
  appId: config.FIREBASE_APP_ID,
  databaseURL: config.FIREBASE_DATABASE_URL || `https://${config.FIREBASE_PROJECT_ID}-default-rtdb.europe-west1.firebasedatabase.app`
};

// Patikrinti ar konfigūracija pilna
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ KLAIDA: Firebase konfigūracija neužpildyta!');
  console.error('Patikrinkite .env failą ir app.config.js');
}

// Inicializuoti Firebase
console.log('🔥 Inicializuojamas Firebase...');
const app = initializeApp(firebaseConfig);
console.log('✅ Firebase inicializuotas');

// Eksportuoti Realtime Database
export const database = getDatabase(app);
console.log('✅ Realtime Database paruoštas');

// Eksportuoti Storage (nuotraukoms)
export const storage = getStorage(app);

export default app;