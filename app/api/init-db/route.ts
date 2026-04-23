import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const leaderboard = db.collection("leaderboard");

    // 인덱스 생성
    await leaderboard.createIndex(
      { round: 1, score: -1, playTime: 1 },
      { name: "round_score_time_idx" }
    );

    await leaderboard.createIndex(
      { playerName: 1 },
      { name: "player_name_idx" }
    );

    await leaderboard.createIndex(
      { createdAt: -1 },
      { name: "created_at_idx" }
    );

    // 현재 인덱스 목록
    const indexes = await leaderboard.indexes();

    // 현재 문서 수
    const count = await leaderboard.countDocuments();

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      indexes: indexes.map((idx) => ({ name: idx.name, key: idx.key })),
      documentCount: count,
    });
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
