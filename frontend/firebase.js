import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCSWGkY08kSiv-96opCwqVd7k1fJ72fx9g",
  authDomain: "felixscores-8f1bc.firebaseapp.com",
  projectId: "felixscores-8f1bc",
  storageBucket: "felixscores-8f1bc.firebasestorage.app",
  messagingSenderId: "231646314912",
  appId: "1:231646314912:web:ea09532cef383b083fa4c5",
  measurementId: "G-1J3EEKH55P"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  orderBy,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};
