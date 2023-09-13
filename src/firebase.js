import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCqfwVxP6OEC_Myhrk7VDg-qahNgfUj4pk",
  authDomain: "jeff-377bd.firebaseapp.com",
  projectId: "jeff-377bd",
  storageBucket: "jeff-377bd.appspot.com",
  messagingSenderId: "30779810174",
  appId: "1:30779810174:web:2cf4285eb9a1b3da7f932f"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };