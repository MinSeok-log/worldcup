import { connectToDatabase, isMongoConfigured } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export interface ScoreRecord {
  _id?: ObjectId;
  playerName: string;
  score: number;
  totalQuestions: number;
  round: number;
  date: string;
  playTime?: number;
  createdAt?: Date;
  previousRank?: number; // 이전 순위 (순위 변동 표시용)
}

// TTL 인덱스 생성 (1주일 = 604800초)
async function ensureTTLIndex() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection("leaderboard");

    // TTL 인덱스 생성 (createdAt 필드 기준 7일 후 삭제)
    await collection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 604800 } // 7일 = 604800초
    );
  } catch (error) {
    // 인덱스가 이미 존재하면 무시
    console.log("TTL index already exists or error:", error);
  }
}

// GET - 리더보드 조회
export async function GET(request: NextRequest) {
  try {
    // MongoDB가 설정되지 않은 경우 빈 배열 반환
    if (!isMongoConfigured()) {
      return NextResponse.json({
        success: true,
        records: [],
        warning: "MongoDB가 설정되지 않았습니다. .env.local 파일에 MONGODB_URI를 설정하세요."
      });
    }

    const { searchParams } = new URL(request.url);
    const round = parseInt(searchParams.get("round") || "8", 10);

    const { db } = await connectToDatabase();
    const collection = db.collection<ScoreRecord>("leaderboard");

    // TTL 인덱스 확인
    await ensureTTLIndex();

    // 점수 높은 순, 같으면 시간 빠른 순
    const records = await collection
      .find({ round })
      .sort({
        score: -1,
        playTime: 1
      })
      .limit(50)
      .toArray();

    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}

// POST - 점수 저장
export async function POST(request: NextRequest) {
  try {
    // MongoDB가 설정되지 않은 경우 에러 반환
    if (!isMongoConfigured()) {
      return NextResponse.json({
        success: false,
        records: [],
        error: "MongoDB가 설정되지 않았습니다. .env.local 파일에 MONGODB_URI를 설정하세요."
      }, { status: 503 });
    }

    const body = await request.json();
    const { playerName, score, totalQuestions, round, playTime } = body;

    if (!playerName || score === undefined || !totalQuestions || !round) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection<ScoreRecord>("leaderboard");

    // TTL 인덱스 확인
    await ensureTTLIndex();

    // 현재 리더보드 상태 가져오기 (이전 순위 계산용)
    const previousRecords = await collection
      .find({ round })
      .sort({ score: -1, playTime: 1 })
      .limit(50)
      .toArray();

    // 이전 순위 맵 생성
    const previousRankMap = new Map<string, number>();
    previousRecords.forEach((record, index) => {
      const key = `${record.playerName}-${record.score}-${record.playTime}`;
      previousRankMap.set(key, index + 1);
    });

    const record: ScoreRecord = {
      playerName,
      score,
      totalQuestions,
      round,
      date: new Date().toLocaleDateString("ko-KR"),
      playTime,
      createdAt: new Date(),
    };

    await collection.insertOne(record);

    // 해당 라운드의 최신 리더보드 반환 (이전 순위 포함)
    const records = await collection
      .find({ round })
      .sort({
        score: -1,
        playTime: 1
      })
      .limit(50)
      .toArray();

    // 각 레코드에 이전 순위 추가
    const recordsWithPreviousRank = records.map((rec, currentRank) => {
      const key = `${rec.playerName}-${rec.score}-${rec.playTime}`;
      const prevRank = previousRankMap.get(key);
      return {
        ...rec,
        currentRank: currentRank + 1,
        previousRank: prevRank || null, // null이면 신규 진입
      };
    });

    return NextResponse.json({ success: true, record, records: recordsWithPreviousRank });
  } catch (error) {
    console.error("Failed to save score:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save score" },
      { status: 500 }
    );
  }
}
