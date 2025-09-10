// functions/src/index.ts

import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldPath, FieldValue } from "firebase-admin/firestore";
import axios from "axios";
import { onDocumentCreated, onDocumentDeleted } from "firebase-functions/v2/firestore";

// Firebase Admin SDK 초기화
initializeApp();
const db = getFirestore();

// --- .env 파일에서 환경 변수를 직접 가져옵니다. ---
const kakaoRestApiKey = process.env.KAKAO_REST_API_KEY;
const kakaoRedirectUri = process.env.KAKAO_REDIRECT_URI;
const kakaoClientSecret = process.env.KAKAO_CLIENT_SECRET;


const metaDocId = "--META--";


// =================================================================
// --- 카카오 로그인 관련 함수 ---
// =================================================================

export const getKakaoLoginUrl = onRequest({ region: "asia-northeast3" }, (req, res) => {
  const allowedOrigins = [
    "https://rmcheck-4e79c.web.app",
    "https://localhost:3000",
    "http://localhost:3000",
  ];

  const origin = req.get("Origin");
  if (origin && allowedOrigins.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  }
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }


  if (!kakaoRestApiKey || !kakaoRedirectUri) {
    logger.error("Kakao environment variables are not set.");
    res.status(500).json({ error: "Server configuration error." });
    return;
  }

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoRestApiKey}&redirect_uri=${kakaoRedirectUri}/auth/kakao&response_type=code`;
  res.json({ auth_url: kakaoAuthUrl });
});


export const kakaoLogin = onCall({ region: "asia-northeast3" }, async (request) => {
  logger.info("kakaoLogin called with data:", request.data);
  if (!kakaoRestApiKey || !kakaoRedirectUri || !kakaoClientSecret) {
    logger.error("Kakao API Key, Redirect URI, or Client Secret is not set in environment variables.");
    throw new HttpsError("internal", "Server configuration error.");
  }

  const code = request.data.code;
  logger.info("Received authorization code in kakaoLogin:", code);
  if (!code) {
    throw new HttpsError("invalid-argument", "Authorization code is required.");
  }

  const tokenUrl = "https://kauth.kakao.com/oauth/token";
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: kakaoRestApiKey,
    redirect_uri: kakaoRedirectUri + "/auth/kakao",
    client_secret: kakaoClientSecret,
    code: code,
  }).toString();

  try {
    interface IKakaoTokenResponse {
      access_token: string;
    }

    const tokenResponse = await axios.post<IKakaoTokenResponse>(tokenUrl, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const accessToken = tokenResponse.data.access_token;

    interface IUserInfoResponse {
      id: string;
      properties: {
        nickname: string;
      };
      kakao_account: {
        email: string;
      };
    }

    const userInfoUrl = "https://kapi.kakao.com/v2/user/me";
    const userInfoResponse = await axios.get<IUserInfoResponse>(userInfoUrl, {
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
// --- 시험지 생성 함수 (모든 기능 및 예외처리 최종 버전) ---
// =================================================================

function getRandomSample<T>(arr: T[], n: number): T[] {
  if (n >= arr.length) return [...arr];
  const shuffled = [...arr];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

// 헬퍼: Firestore에서 문서를 가져오는 함수
async function fetchDocs(collection: string, ids: string[]): Promise<Map<string, any>> {
    if (ids.length === 0) return new Map();
    const promises = [];
    for (let i = 0; i < ids.length; i += 30) {
        const chunk = ids.slice(i, i + 30);
        const query = db.collection(collection).where(FieldPath.documentId(), 'in', chunk);
        promises.push(query.get());
    }
    const snapshots = await Promise.all(promises);
    const results = new Map<string, any>();
    snapshots.forEach(snapshot => snapshot.forEach(doc => results.set(doc.id, { id: doc.id, ...doc.data() })));
    return results;
}


export const generateExam = onCall(
  { region: "asia-northeast3", memory: "512MiB" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "로그인이 필요합니다.");
    }
    logger.info("카카오 환경변수 정보 로깅");
    logger.info(`KAKAO_REST_API_KEY: ${kakaoRestApiKey}`);
    logger.info(`KAKAO_REDIRECT_URI: ${kakaoRedirectUri}`);
    logger.info(`KAKAO_CLIENT_SECRET: ${kakaoClientSecret}`);

    const uid = request.auth.uid;
    const { unitIds, questionCount = 30, mode = "new" } = request.data;

    logger.info(`시험지 생성 요청: uid=${uid}, mode=${mode}, count=${questionCount}, unitIds=${unitIds}`);

    if (!unitIds || unitIds.length === 0) {
      throw new HttpsError("invalid-argument", "단원을 선택해야 합니다.");
    }

    try {
      // 1. 메타 문서에서 단원별 문제 ID 가져오기
      const metaDoc = await db.collection("questionBank").doc("--META--").get();
      if (!metaDoc.exists) throw new HttpsError("not-found", "메타 문서(\"--META--\")가 없습니다.");
      const allMap = metaDoc.data()?.all_question_ids || {};
      const candidateIds: string[] = unitIds.flatMap((u: string) => (allMap[u] as string[] | undefined) || []);

      if (candidateIds.length === 0) {
        throw new HttpsError("not-found", "해당 단원에 등록된 문제가 없습니다.");
      }

      // 2. 유저 풀이 기록
      const userStatsRef = db.collection("userQuestionStats").doc(`stats_${uid}`);
      const userStatsSnap = await userStatsRef.get();
      const stats: Record<string, { latestResult: string }> = userStatsSnap.exists ? userStatsSnap.data()?.stats || {} : {};

      const solvedIds = new Set(Object.keys(stats));
      const unsolvedIds = candidateIds.filter((id) => !solvedIds.has(id));
      const solvedInCandidates = candidateIds.filter((id) => solvedIds.has(id));

      // solved 분류
      const incorrectIds = solvedInCandidates.filter((id) => stats[id]?.latestResult === "X");
      const correctIds = solvedInCandidates.filter((id) => stats[id]?.latestResult === "O");
      const reviewPool = [...incorrectIds, ...correctIds];

      let selectedIds: string[] = [];

      // 3. 모드별 처리
      if (mode === "new") {
        if (unsolvedIds.length >= questionCount) {
          selectedIds = getRandomSample(unsolvedIds, questionCount);
        } else {
          const needMore = questionCount - unsolvedIds.length;
          const extra = getRandomSample(solvedInCandidates, needMore);
          selectedIds = [...unsolvedIds, ...extra];
        }
      }
      else if (mode === "new_review") {
        const reviewGoal = Math.ceil(questionCount / 3);
        const newGoal = questionCount - reviewGoal;

        if (unsolvedIds.length >= newGoal && reviewPool.length >= reviewGoal) {
          let newSelected = getRandomSample(unsolvedIds, newGoal);
          const fromIncorrect = Math.min(reviewGoal, incorrectIds.length);
          let reviewSelected = [
            ...getRandomSample(incorrectIds, fromIncorrect),
            ...getRandomSample(correctIds, reviewGoal - fromIncorrect),
          ];
          selectedIds = [...newSelected, ...reviewSelected];
        }
        else if(unsolvedIds.length >= newGoal && reviewPool.length < reviewGoal) {
          let newSelected = getRandomSample(unsolvedIds, newGoal);
          let reviewSelected = [...reviewPool];
          // 부족분 채우기
          const totalSelected = newSelected.length + reviewSelected.length;
          const moreNew = getRandomSample(
            unsolvedIds.filter((id) => !newSelected.includes(id)),
            questionCount - totalSelected
          );
          selectedIds = [...newSelected, ...reviewSelected, ...moreNew];
        }
        else if(unsolvedIds.length < newGoal && reviewPool.length >= reviewGoal) {
          const _reviewGoal = questionCount - unsolvedIds.length;
          let newSelected = [...unsolvedIds];
          const fromIncorrect = Math.min(_reviewGoal, incorrectIds.length);
          let reviewSelected = [
            ...getRandomSample(incorrectIds, fromIncorrect),
            ...getRandomSample(correctIds, reviewGoal - fromIncorrect),
          ];
          selectedIds = [...newSelected, ...reviewSelected];
        }
        else {
          // unsolvedIds.length < newGoal && reviewPool.length < reviewGoal
          // 이런 경우는 있을 수 없다!
          // raise http exception
          throw new HttpsError("internal", "가용 문항 수가 요청한 문항 수보다 적습니다.");
        }
      }
      else if (mode === "review_all") {
        if (reviewPool.length >= questionCount) {
          const fromIncorrect = Math.min(questionCount, incorrectIds.length);
          selectedIds = [
            ...getRandomSample(incorrectIds, fromIncorrect),
            ...getRandomSample(correctIds, questionCount - fromIncorrect),
          ];
        } else {
          selectedIds = [...reviewPool];
        }
      }
      else if (mode === "review_incorrect") {
        selectedIds = incorrectIds.length > questionCount
          ? getRandomSample(incorrectIds, questionCount)
          : [...incorrectIds];
      }
      else {
        throw new HttpsError("invalid-argument", "유효하지 않은 모드입니다.");
      }

      if (selectedIds.length === 0) {
        throw new HttpsError("not-found", "조건에 맞는 문제가 없습니다.");
      }
      // shuffle selectedIds
      selectedIds.sort(() => Math.random() - 0.5);

      // 4. 문제 데이터 fetch
      const questionsMap = await fetchDocs("questionBank", selectedIds);
      const questions = selectedIds.map((id) => questionsMap.get(id)).filter(Boolean);

      return { questions, status: "SUCCESS" };
    } catch (error) {
      logger.error("시험지 생성 오류:", error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError("internal", "시험지 생성 중 오류가 발생했습니다.");
    }
  }
);


// =================================================================
// --- DB 트리거 ---
// =================================================================

// 새 문서가 생성될 때
const collectionName = "questionBank";

// 문서가 생성될 때
export const onQuestionCreated = onDocumentCreated(
  {
    document: `/${collectionName}/{docId}`,
    region: "asia-northeast3",
  },
  async (event) => {
    const docId = event.params.docId;
    if (docId === metaDocId) return; // 메타 문서 자체는 무시

    try {
      // 새로 생성된 문서의 unitId 값을 읽는다
      const newDocSnap = await db.collection(collectionName).doc(docId).get();
      const unitId = newDocSnap.get("unitId");
      if (!unitId) {
        logger.warn(`⚠️ 문서 ${docId}에 unitId가 없음 → 메타 문서에 반영하지 않음`);
        return;
      }

      const metaDocRef = db.collection(collectionName).doc(metaDocId);

      // map 구조에서 unitId 키 아래에 arrayUnion
      await metaDocRef.set(
        {
          all_question_ids: {
            [unitId]: FieldValue.arrayUnion(docId),
          },
        },
        { merge: true }
      );

      logger.info(`✅ 문서 ${docId} 추가됨 → unitId=${unitId} 배열에 반영`);
    } catch (error) {
      logger.error("onQuestionCreated 동기화 실패:", error);
    }
  }
);

// 문서가 삭제될 때
export const onQuestionDeleted = onDocumentDeleted(
  {
    document: `/${collectionName}/{docId}`,
    region: "asia-northeast3",
  },
  async (event) => {
    const docId = event.params.docId;
    if (docId === metaDocId) return;

    try {
      // 삭제 전의 데이터 스냅샷
      const data = event.data?.data(); 
      const unitId = data?.unitId;

      if (!unitId) {
        logger.warn(`⚠️ 문서 ${docId} 삭제 이벤트에서 unitId 없음 → 메타 문서 수정 불가`);
        return;
      }

      const metaDocRef = db.collection(collectionName).doc(metaDocId);

      await metaDocRef.update({
        [`all_question_ids.${unitId}`]: FieldValue.arrayRemove(docId),
      });

      logger.info(`🗑️ 문서 ${docId} 삭제됨 → unitId=${unitId} 배열에서 제거`);
    } catch (error) {
      logger.error("onQuestionDeleted 동기화 실패:", error);
    }
  }
);

// 시험지 답안 제출할 때
export const onSubmissionCreated = onDocumentCreated(
  {
    document: `/submissions/{submissionId}`,
    region: "asia-northeast3",
  },
  async (event) => {
    try {
      const submissionId = event.params.submissionId;
      const data = event.data?.data();

      if (!data) {
        logger.warn(`❌ Submission ${submissionId} 데이터가 없음`);
        return;
      }

      const userId = data.userId;
      if (!userId) {
        logger.warn(`❌ Submission ${submissionId}에 userId 없음`);
        return;
      }

      const studentRef = db.collection("students").doc(userId);

      await studentRef.set(
        {
          userSubmissions: FieldValue.arrayUnion(submissionId),
        },
        { merge: true } // userSubmissions 필드가 없어도 새 배열 생성됨
      );

      logger.info(
        `✅ submission ${submissionId} 추가됨 → students/${userId}.userSubmissions`
      );
    } catch (error) {
      logger.error("onSubmissionCreated 처리 중 오류:", error);
    }
  }
);