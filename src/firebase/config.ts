// src/firebase/config.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions"; // 추가

const firebaseConfig = {
  apiKey: "AIzaSyC5SUu7e-aNUfgBEeEoXEwjONknWKhbtBI",
  authDomain: "rmcheck-4e79c.firebaseapp.com",
  projectId: "rmcheck-4e79c",
  storageBucket: "rmcheck-4e79c.appspot.com",
  messagingSenderId: "1081522017302",
  appId: "1:1081522017302:web:b7bd3e0436a05c92c29137"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app, 'asia-northeast3'); // Functions 리전 지정

// generateExam 함수를 직접 호출할 수 있는 callable function 생성
const generateExam = httpsCallable(functions, 'generateExam');

export { app, auth, db, functions, generateExam };