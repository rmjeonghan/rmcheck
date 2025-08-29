// functions/src/index.ts

import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldPath, Query } from "firebase-admin/firestore";
import axios from "axios";

// Firebase Admin SDK 초기화
initializeApp();
const db = getFirestore();

// --- .env 파일에서 환경 변수를 직접 가져옵니다. ---
const kakaoRestApiKey = process.env.KAKAO_REST_API_KEY;
const kakaoRedirectUri = process.env.KAKAO_REDIRECT_URI;
const kakaoClientSecret = process.env.KAKAO_CLIENT_SECRET;


// =================================================================
// --- 카카오 로그인 관련 함수 ---
// =================================================================

export const getKakaoLoginUrl = onRequest({ region: "asia-northeast3" }, (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (!kakaoRestApiKey || !kakaoRedirectUri) {
    logger.error("Kakao environment variables are not set.");
    res.status(500).json({ error: "Server configuration error." });
    return;
  }
  
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoRestApiKey}&redirect_uri=${kakaoRedirectUri}&response_type=code`;
  res.json({ auth_url: kakaoAuthUrl });
});

export const kakaoLogin = onCall({ region: "asia-northeast3" }, async (request) => {
  if (!kakaoRestApiKey || !kakaoRedirectUri || !kakaoClientSecret) {
    logger.error("Kakao API Key, Redirect URI, or Client Secret is not set in environment variables.");
    throw new HttpsError("internal", "Server configuration error.");
  }

  const code = request.data.code;
  if (!code) {
    throw new HttpsError("invalid-argument", "Authorization code is required.");
  }

  const tokenUrl = "https://kauth.kakao.com/oauth/token";
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: kakaoRestApiKey,
    redirect_uri: kakaoRedirectUri,
    client_secret: kakaoClientSecret,
    code: code,
  }).toString();

  try {
    const tokenResponse = await axios.post(tokenUrl, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const accessToken = tokenResponse.data.access_token;

    const userInfoUrl = "https://kapi.kakao.com/v2/user/me";
    const userInfoResponse = await axios.get(userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const kakaoUser = userInfoResponse.data;

    const uid = `kakao:${kakaoUser.id}`;
    const displayName = kakaoUser.properties.nickname;
    const email = kakaoUser.kakao_account.email;

    try {
      await getAuth().updateUser(uid, { displayName, email });
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        await getAuth().createUser({ uid, displayName, email });
      } else {
        throw error;
      }
    }
    
    const firebaseToken = await getAuth().createCustomToken(uid);
    return { firebase_token: firebaseToken };

  } catch (error) {
    logger.error("Kakao login failed", error);
    throw new HttpsError("internal", "Kakao authentication failed.");
  }
});


// =================================================================
// --- 시험지 생성 함수 (최종 완성 버전) ---
// =================================================================

// 배열을 무작위로 섞는 헬퍼 함수
function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 문서를 가져오는 헬퍼 함수
async function fetchDocumentsByIds(ids: string[]) {
    if (ids.length === 0) return [];
    // Firestore 'in' 쿼리는 30개 제한이 있으므로, 데이터를 분할해서 요청합니다.
    const promises = [];
    for (let i = 0; i < ids.length; i += 30) {
        const chunk = ids.slice(i, i + 30);
        const query = db.collection("questionBank").where(FieldPath.documentId(), 'in', chunk);
        promises.push(query.get());
    }
    const snapshots = await Promise.all(promises);
    return snapshots.flatMap(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
}


export const generateExam = onCall({ region: "asia-northeast3" }, async (request) => {
  // 🚨 개발이 끝나면 이 주석을 반드시 제거해야 합니다.
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "로그인이 필요합니다.");
  }
  const uid = request.auth.uid;


  const { unitIds, questionCount = 30, mode = 'new' } = request.data;
  
  logger.info(`시험지 생성 요청: uid=${uid}, mode=${mode}, unitIds=${unitIds?.join(', ')}, count=${questionCount}`);

  try {
    const submissionsSnapshot = await db.collection("submissions").where("userId", "==", uid).get();
    const allAnsweredIds = new Set<string>();
    const allIncorrectIds = new Set<string>();
    submissionsSnapshot.forEach(doc => {
        const data = doc.data();
        (data.questionIds || []).forEach((id: string) => allAnsweredIds.add(id));
        (data.incorrectQuestionIds || []).forEach((id: string) => allIncorrectIds.add(id));
    });

    let questions: any[] = [];

    if (mode === 'mixed') {
        const newCount = Math.ceil(questionCount * (2 / 3));
        const reviewCount = questionCount - newCount;

        // 1. 신규 문제 가져오기 (별도 쿼리)
        let newQuery = db.collection("questionBank").where("unitId", "in", unitIds);
        const newQuestionsSnapshot = await newQuery.get();
        const newQuestionCandidates = newQuestionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const newQuestions = shuffleArray(newQuestionCandidates.filter(q => !allAnsweredIds.has(q.id))).slice(0, newCount);
        questions = questions.concat(newQuestions);

        // 2. 복습 문제 가져오기 (별도 쿼리)
        const reviewIds = allIncorrectIds.size > 0 ? Array.from(allIncorrectIds) : Array.from(allAnsweredIds);
        if (reviewIds.length > 0) {
            const reviewQuestions = shuffleArray(await fetchDocumentsByIds(reviewIds)).slice(0, reviewCount);
            questions = questions.concat(reviewQuestions);
        }

    } else { // 'new', 'review_all', 'review_incorrect' 모드
        let query: Query = db.collection("questionBank");

        if (mode === 'new') {
            if (!Array.isArray(unitIds) || unitIds.length === 0) throw new HttpsError("invalid-argument", "단원 ID 목록이 필요합니다.");
            // Firestore 제약으로 인해, 먼저 단원에 해당하는 모든 문서를 가져온 후 메모리에서 필터링합니다.
            const unitSnapshot = await query.where("unitId", "in", unitIds).get();
            const unitQuestions = unitSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            questions = shuffleArray(unitQuestions.filter(q => !allAnsweredIds.has(q.id))).slice(0, questionCount);

        } else if (mode === 'review_all' || mode === 'review_incorrect') {
            const targetIds = mode === 'review_all' ? Array.from(allAnsweredIds) : Array.from(allIncorrectIds);
            if (targetIds.length > 0) {
                questions = shuffleArray(await fetchDocumentsByIds(targetIds)).slice(0, questionCount);
            }
        }
    }
    
    if (questions.length === 0) {
        throw new HttpsError("not-found", "조건에 맞는 문제가 없습니다. 단원을 추가하거나 다른 모드를 선택해주세요.");
    }

    logger.info(`${questions.length}개의 문제로 시험지 생성 완료.`);
    return { questions: shuffleArray(questions) };

  } catch (error) {
    logger.error("시험지 생성 중 오류 발생:", error);
    throw new HttpsError("internal", "시험지를 생성하는 중 오류가 발생했습니다.");
  }
});