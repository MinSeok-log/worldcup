import { MongoClient } from "mongodb";

const uri = "mongodb+srv://dbalstjrworldcup_db_user:bc88YA2sWUKrPFIQ@cluster0.7hsnab7.mongodb.net/?appName=Cluster0";
const dbName = "anime_worldcup";

async function initDatabase() {
  console.log("🚀 MongoDB 초기화 시작...");

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ MongoDB 연결 성공");

    const db = client.db(dbName);

    // leaderboard 컬렉션 생성 (없으면 자동 생성됨)
    const collections = await db.listCollections({ name: "leaderboard" }).toArray();

    if (collections.length === 0) {
      await db.createCollection("leaderboard");
      console.log("✅ leaderboard 컬렉션 생성됨");
    } else {
      console.log("ℹ️ leaderboard 컬렉션이 이미 존재합니다");
    }

    const leaderboard = db.collection("leaderboard");

    // 인덱스 생성
    // 1. 라운드별 + 점수순 + 시간순 복합 인덱스
    await leaderboard.createIndex(
      { round: 1, score: -1, playTime: 1 },
      { name: "round_score_time_idx" }
    );
    console.log("✅ round_score_time 인덱스 생성됨");

    // 2. 플레이어 이름으로 검색용 인덱스
    await leaderboard.createIndex(
      { playerName: 1 },
      { name: "player_name_idx" }
    );
    console.log("✅ player_name 인덱스 생성됨");

    // 3. 생성일 인덱스 (최근 기록 조회용)
    await leaderboard.createIndex(
      { createdAt: -1 },
      { name: "created_at_idx" }
    );
    console.log("✅ created_at 인덱스 생성됨");

    // 현재 인덱스 목록 출력
    const indexes = await leaderboard.indexes();
    console.log("\n📋 현재 인덱스 목록:");
    indexes.forEach((idx) => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    // 현재 문서 수 확인
    const count = await leaderboard.countDocuments();
    console.log(`\n📊 현재 저장된 기록 수: ${count}개`);

    console.log("\n✨ MongoDB 초기화 완료!");

  } catch (error) {
    console.error("❌ 오류 발생:", error);
  } finally {
    await client.close();
    console.log("🔌 MongoDB 연결 종료");
  }
}

initDatabase();
