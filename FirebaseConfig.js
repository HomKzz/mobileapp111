import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCr9fDRDlUTz2b_k0ZEwMWH7eXqWJDkw1o",
  authDomain: "period-23f5f.firebaseapp.com",
  projectId: "period-23f5f",
  storageBucket: "period-23f5f.appspot.com",
  messagingSenderId: "571486398171",
  appId: "1:571486398171:web:5b8c3a89fa53218a050efe",
  measurementId: "G-H1GH6GJ7X8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };