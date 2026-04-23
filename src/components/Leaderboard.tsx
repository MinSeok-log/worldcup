"use client";

import { cn } from "@/lib/utils";
import { formatPlayTime, type ScoreRecord } from "@/lib/animeData";

interface LeaderboardProps {
  records: ScoreRecord[];
  isLoading?: boolean;
  currentPlayerName?: string;
  currentScore?: number;
  currentPlayTime?: number;
  showRankChange?: boolean;
}

function RankChangeIndicator({ currentRank, previousRank }: { currentRank: number; previousRank: number | null | undefined }) {
  // 신규 진입
  if (previousRank === null || previousRank === undefined) {
    return (
      <span className="ml-1 inline-flex items-center animate-bounce">
        <span className="text-xs font-bold text-emerald-400">NEW</span>
      </span>
    );
  }

  const change = previousRank - currentRank;

  if (change > 0) {
    // 순위 상승
    return (
      <span className="ml-1 inline-flex items-center gap-0.5 animate-pulse">
        <svg
          className="h-3 w-3 text-green-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-xs font-bold text-green-400">{change}</span>
      </span>
    );
  }

  if (change < 0) {
    // 순위 하락
    return (
      <span className="ml-1 inline-flex items-center gap-0.5 animate-pulse">
        <svg
          className="h-3 w-3 text-red-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-xs font-bold text-red-400">{Math.abs(change)}</span>
      </span>
    );
  }

  // 순위 유지
  return (
    <span className="ml-1 inline-flex items-center">
      <span className="text-xs text-zinc-500">-</span>
    </span>
  );
}

export function Leaderboard({
  records,
  isLoading = false,
  currentPlayerName,
  currentScore,
  currentPlayTime,
  showRankChange = false,
}: LeaderboardProps) {
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
        <p className="mt-2 text-zinc-500">불러오는 중...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return <p className="py-8 text-center text-zinc-500">아직 기록이 없습니다.</p>;
  }

  return (
    <div className="max-h-72 space-y-2 overflow-y-auto">
      {records.map((record, index) => {
        const isCurrentRecord =
          currentPlayerName &&
          record.playerName === currentPlayerName &&
          record.score === currentScore &&
          record.playTime === currentPlayTime;

        const currentRank = record.currentRank ?? index + 1;

        return (
          <div
            key={`${record.playerName}-${record.date}-${index}`}
            className={cn(
              "flex items-center justify-between rounded-xl p-3 transition-all duration-500",
              isCurrentRecord
                ? "border border-rose-500/30 bg-rose-500/20 animate-pulse"
                : "bg-zinc-800",
              // 신규 진입 시 특별한 효과
              showRankChange && record.previousRank === null && "ring-2 ring-emerald-500/50 animate-[slideIn_0.5s_ease-out]"
            )}
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-transform duration-300",
                  index === 0
                    ? "bg-yellow-500 text-black scale-110"
                    : index === 1
                      ? "bg-zinc-400 text-black"
                      : index === 2
                        ? "bg-amber-700 text-white"
                        : "bg-zinc-700 text-zinc-400"
                )}
              >
                {index + 1}
              </span>
              <div className="flex items-center">
                <span className="font-medium text-white">{record.playerName}</span>
                {showRankChange && (
                  <RankChangeIndicator
                    currentRank={currentRank}
                    previousRank={record.previousRank}
                  />
                )}
              </div>
              {isCurrentRecord && (
                <span className="rounded-full bg-rose-500/30 px-2 py-0.5 text-xs font-medium text-rose-400">
                  내 기록
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-right">
              <span className="font-bold text-rose-400">
                {record.score}/{record.totalQuestions}
              </span>
              {record.playTime !== undefined && (
                <span className="font-mono text-sm text-cyan-400">
                  {formatPlayTime(record.playTime)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
