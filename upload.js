// 필요한 라이브러리 가져오기
const admin = require('firebase-admin');
const fs = require('fs');
const iconv = require('iconv-lite'); // 인코딩 변환을 위한 라이브러리

// 1. 서비스 계정 키 파일 경로 설정
const serviceAccount = require('./serviceAccountKey.json');

// 2. Firebase 앱 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const collectionName = 'questionBank';

// 3. CSV 파일 경로 설정 (테스트용)
const csvFilePath = './test.csv';

// 지능형 CSV 분석 함수 (줄바꿈, 따옴표, 인코딩 처리)
function intelligentCsvParser(filePath) {
  console.log('파일을 EUC-KR 인코딩으로 읽습니다...');
  
  const fileBuffer = fs.readFileSync(filePath);
  const fileContent = iconv.decode(fileBuffer, 'euc-kr');
  
  const lines = fileContent.trim().split(/\r?\n/);

  if (lines.length < 2) {
    throw new Error('CSV 파일에 헤더와 데이터가 모두 필요합니다.');
  }

  const headers = lines.shift().split(',').map(h => h.trim());
  const headerCount = headers.length;
  console.log(`인식된 헤더 (총 ${headerCount}개):`, headers);

  if (!headers.includes('문제')) {
    throw new Error("CSV 헤더에서 '문제' 열을 찾을 수 없습니다. 파일 상단의 헤더 이름을 확인해주세요.");
  }

  const records = [];
  let currentRecordLines = [];

  lines.forEach(line => {
    let inQuotes = false;
    let tempLine = '';
    for (const char of line) {
      if (char === '"') inQuotes = !inQuotes;
      // 따옴표 안의 쉼표는 임시 문자로 치환하여 줄바꿈 분석에 영향 없도록 함
      if (char === ',' && inQuotes) tempLine += '||COMMA||'; 
      else tempLine += char;
    }
    const columnCount = tempLine.split(',').length;

    if (columnCount >= headerCount && currentRecordLines.length > 0) {
      records.push(currentRecordLines.join('\n'));
      currentRecordLines = [line];
    } else {
      currentRecordLines.push(line);
    }
  });
  if (currentRecordLines.length > 0) {
    records.push(currentRecordLines.join('\n'));
  }
  
  console.log(`총 ${records.length}개의 독립된 문제(행)를 식별했습니다.`);

  return records.map(record => {
    // CSV 값을 분리하고 정리하는 로직
    const values = record.split(',').map(v => {
        // 임시 문자를 다시 쉼표로 복원
        let cleanV = v.replace(/\|\|COMMA\|\|/g, ','); 
        // 값 양쪽의 큰따옴표 제거
        if (cleanV.startsWith('"') && cleanV.endsWith('"')) {
            return cleanV.slice(1, -1).replace(/""/g, '"');
        }
        return cleanV;
    });
    
    // 헤더와 데이터를 객체로 매핑
    return headers.reduce((obj, header, index) => {
        obj[header] = values[index] ? values[index].trim() : '';
        return obj;
    }, {});
  });
}

async function main() {
  try {
    const documents = intelligentCsvParser(csvFilePath).map(row => {
        // '문제' 필드가 비어있으면 해당 데이터는 건너뛰기
        if (!row['문제']) return null;

        // 비어있는 선지('')를 자동으로 제거
        const choices = ['①', '②', '③', '④', '⑤']
            .map(key => row[key] ? row[key].trim() : '')
            .filter(choice => choice); // .filter(Boolean)과 동일

        const textbooks = ['동아', '미래엔', '비상', '지학사', '천재']
            .filter(name => row[name] === 'TRUE');
        
        const answerSymbol = row['정답'] ? row['정답'].trim() : '';
        const symbols = ['①', '②', '③', '④', '⑤'];
        const answerIndex = symbols.indexOf(answerSymbol);
        
        let choiceCount = parseInt(row['선지 개수'], 10);

        return {
            questionText: row['문제'] || '',
            choices: choices,
            answerIndex: answerIndex !== -1 ? answerIndex : null,
            explanation: row['학습 개념 해설'] || '',
            mainChapter: row['대단원'] || '',
            subChapter: row['중단원'] || '',
            unitId: row['개념'] || '',
            format: row['문항 형식'] || '',
            conceptLevel: row['Main/Sub'] || '',
            textbooks: textbooks,
            cognitiveLevel: row['출제 수준'] || '',
            choiceCount: isNaN(choiceCount) ? 0 : choiceCount,
        };
    }).filter(doc => doc !== null); // null로 처리된 데이터 최종 제거

    if (documents.length === 0) {
      console.log('업로드할 유효한 데이터가 없습니다. CSV 파일 내용을 확인해주세요.');
      return;
    }

    console.log(`총 ${documents.length}개의 문항 데이터를 가공했습니다. 업로드를 시작합니다.`);
    await uploadToFirestore(documents);

  } catch (error) {
    console.error('스크립트 실행 중 심각한 오류가 발생했습니다:', error.message);
  }
}

async function uploadToFirestore(data) {
    // 테스트 A에서는 데이터 양이 적으므로 batchSize가 큰 의미는 없습니다.
    const batchSize = 500;
    let uploadedCount = 0;
    console.log(`Firestore에 ${data.length}개의 문서를 ${batchSize}개씩 나누어 업로드합니다.`);

    for (let i = 0; i < data.length; i += batchSize) {
        const batch = db.batch();
        const chunk = data.slice(i, i + batchSize);
        chunk.forEach(docData => {
            const docRef = db.collection(collectionName).doc();
            batch.set(docRef, docData);
        });
        try {
            await batch.commit();
            uploadedCount += chunk.length;
            console.log(`${uploadedCount} / ${data.length}개 업로드 완료...`);
        } catch (e) {
            console.error('Firestore 배치 업로드 중 오류 발생:', e);
            return;
        }
    }
    console.log(`🎉 모든 데이터 업로드가 성공적으로 완료되었습니다! 총 ${uploadedCount}개.`);
}

main();