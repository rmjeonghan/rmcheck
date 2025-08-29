// src/firebase.ts

import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyC5SUu7e-aNUfgBEeEoXEwjONknWKhbtBI",
  authDomain: "rmcheck-4e79c.firebaseapp.com",
  projectId: "rmcheck-4e79c",
  storageBucket: "rmcheck-4e79c.firebasestorage.app",
  messagingSenderId: "1081522017302",
  appId: "1:1081522017302:web:b7bd3e0436a05c92c29137"
};

// Firebase 앱이 이미 초기화되었는지 확인
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const db = getFirestore(app);
const functions = getFunctions(app, 'asia-northeast3'); // ◀ 함수 리전을 서울로 지정

export { db, functions };