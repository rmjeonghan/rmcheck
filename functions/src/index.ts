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
      }
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

export const generateExam = onCall({ region: "asia-northeast3", memory: "512MiB" }, async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "로그인이 필요합니다.");
    
    const uid = request.auth.uid;
    const { unitIds, questionCount = 30, mode = 'new' } = request.data;
    logger.info(`시험지 생성 요청: uid=${uid}, mode=${mode}, count=${questionCount}, unitIds=${unitIds}`);
    logger.info(`unitIds`);
    logger.info(`${unitIds}`);

    try {
        const statsQuery = db.collection("userQuestionStats").where("userId", "==", uid);
        const statsSnapshot = await statsQuery.get();
        
        const allAnsweredIds = new Set<string>();
        const incorrectIds = new Set<string>();
        statsSnapshot.forEach(doc => {
            allAnsweredIds.add(doc.data().questionId);
            if (doc.data().isCorrect === false) {
                incorrectIds.add(doc.data().questionId);
            }
        });

        if (mode === 'review_incorrect' && incorrectIds.size === 0) {
            return { questions: [], status: 'NO_INCORRECT', message: '훌륭해요! 틀린 문제가 하나도 없어요. 🎉' };
        }

        let questions: any[] = [];
        
        if (mode === 'new') {
            if (!unitIds || unitIds.length === 0) throw new HttpsError("invalid-argument", "단원을 선택해야 합니다.");
            
            let qQuery = db.collection("questionBank")
                .where("unitId", "in", unitIds)
                .limit(questionCount * 2);

            let snapshot = await qQuery.get();
            let candidates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            if (candidates.length < questionCount * 2) {
                qQuery = db.collection("questionBank")
                    .where("unitId", "in", unitIds)
                    .limit(questionCount * 2);
                snapshot = await qQuery.get();
                candidates.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }
            questions = candidates.filter(q => !allAnsweredIds.has(q.id)).slice(0, questionCount);

        } else if (mode === 'new_review') { // 'mixed' 대신 'new_review'로 수정된 버전
            if (!unitIds || unitIds.length === 0) throw new HttpsError("invalid-argument", "단원을 선택해야 합니다.");

            // 1. 복습 문항 가져오기
            const reviewCountGoal = Math.floor(questionCount / 3);
            const reviewIds = Array.from(incorrectIds);
            const reviewQuestionsMap = await fetchDocs("questionBank", reviewIds.slice(0, reviewCountGoal));
            questions.push(...Array.from(reviewQuestionsMap.values()));

            // 2. 필요한 신규 문항 개수 계산
            const newCount = questionCount - questions.length;

            // 3. 신규 문항 가져오기
            if (newCount > 0) {
                let qQuery = db.collection("questionBank")
                    .where("unitId", "in", unitIds)
                    .limit(newCount * 2);

                let snapshot = await qQuery.get();
                let candidates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                if (candidates.length < newCount * 2) {
                    qQuery = db.collection("questionBank")
                        .where("unitId", "in", unitIds)
                        .limit(newCount * 2);
                    snapshot = await qQuery.get();
                    candidates.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }
                
                const newQuestions = candidates.filter(q => !allAnsweredIds.has(q.id)).slice(0, newCount);
                questions.push(...newQuestions);
            }
            
        } else { // review_all, review_incorrect
            const targetIds = mode === 'review_all' ? Array.from(allAnsweredIds) : Array.from(incorrectIds);
            const reviewQuestionsMap = await fetchDocs("questionBank", targetIds.slice(0, questionCount));
            questions = Array.from(reviewQuestionsMap.values());
        }

        if (questions.length === 0) {
            if (mode !== 'new' && allAnsweredIds.size === 0) {
                 throw new HttpsError("not-found", "아직 학습 기록이 없어요. 신규 문항 풀이부터 시작해보세요!");
            }
            throw new HttpsError("not-found", "조건에 맞는 문제가 없습니다.");
        }
        
        const chapterIds = [...new Set(questions.map(q => q.unitId.substring(0, 3)))];
        const chaptersMap = await fetchDocs("curriculum", chapterIds);
        questions.forEach(q => {
            const chapter = chaptersMap.get(q.unitId.substring(0, 3));
            if (chapter) {
                const subChapterData = chapter.subChapters.find((sc: string) => sc.startsWith(q.unitId));
                q.subChapterName = subChapterData ? subChapterData.split(': ')[1] : '';
            }
        });

        return { questions, status: 'SUCCESS' };

    } catch (error) {
        logger.error(`시험지 생성 중 오류 발생(mode=${mode}):`, error);
        if (error instanceof HttpsError) throw error;
        throw new HttpsError("internal", "시험지를 생성하는 중 오류가 발생했습니다.");
    }
});


// =================================================================
// --- DB 트리거 ---
// =================================================================

// 새 문서가 생성될 때
const collectionName = "questionBank";
const metaDocId = "-1";

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
