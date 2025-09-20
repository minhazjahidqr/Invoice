// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "studio-5335945423-a216d",
  "appId": "1:1050559486970:web:13db5befeefa250e4ee243",
  "apiKey": "AIzaSyAeRt1kqnAHXkrWyHjFLyPuXSyilskB63Y",
  "authDomain": "studio-5335945423-a216d.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1050559486970"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
