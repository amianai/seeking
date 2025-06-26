import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBwbGAKyfcEHfxyM8bH1dA1Wq1bmNeqsJY',
  authDomain: 'progetto-prog-2.firebaseapp.com',
  projectId: 'progetto-prog-2',
  storageBucket: 'progetto-prog-2.firebasestorage.app',
  messagingSenderId: '488534102444',
  appId: '1:488534102444:web:208a40eabcb2035212aa09'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

