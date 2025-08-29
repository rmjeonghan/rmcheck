// addRandomField.mjs
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import serviceAccount from './serviceAccountKey.json' with { type: 'json' };

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function addRandomField() {
    console.log('questionBank에서 모든 문서를 가져옵니다...');
    const snapshot = await db.collection('questionBank').get();
    
    if (snapshot.empty) {
        console.log('업데이트할 문서를 찾을 수 없습니다.');
        return;
    }

    console.log(`총 ${snapshot.size}개의 문서를 확인합니다. random 필드 추가/업데이트를 시작합니다.`);
    
    const batchArray = [];
    let currentBatch = db.batch();
    let operationCount = 0;
    
    snapshot.forEach((doc) => {
        // 모든 문서에 random 필드를 추가하거나, 이미 있다면 새 무작위 값으로 덮어씁니다.
        currentBatch.update(doc.ref, { random: Math.random() });
        operationCount++;

        if (operationCount === 499) {
            batchArray.push(currentBatch);
            currentBatch = db.batch();
            operationCount = 0;
        }
    });

    if (operationCount > 0) {
        batchArray.push(currentBatch);
    }

    if (batchArray.length === 0) {
        console.log('업데이트할 문서가 없습니다.');
        return;
    }

    console.log(`총 ${snapshot.size}개의 문서에 random 필드를 추가/업데이트합니다.`);
    
    await Promise.all(batchArray.map(batch => batch.commit()));
    
    console.log('random 필드 추가/업데이트가 성공적으로 완료되었습니다.');
}

addRandomField().catch(console.error);