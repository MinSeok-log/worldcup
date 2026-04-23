"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  formatPlayTime,
  getAnimeList,
  getChosung,
  getLetterCountHint,
  getPartialRevealHint,
  fetchLeaderboard,
  saveScoreToServer,
  shuffleArray,
  type Anime,
} from "@/lib/animeData";
import type { ScoreRecord } from "@/lib/animeData";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Leaderboard } from "@/components/Leaderboard";
import { cn } from "@/lib/utils";

type GameState = "name-input" | "playing" | "result";

interface QuizResult {
  anime: Anime;
  userAnswer: string;
  isCorrect: boolean;
  hintsUsed: number;
}

interface HintState {
  letterCount: boolean;
  chosung: boolean;
  genre: boolean;
  partial: boolean;
  year: boolean;
}

const ROUND_OPTIONS = [8, 16, 32] as const;
type RoundOption = (typeof ROUND_OPTIONS)[number];

const MAX_HINTS_PER_QUESTION = 3;

// Floating particles component - using fixed positions to avoid hydration mismatch
const PARTICLE_POSITIONS = [
  { left: 5, top: 15, duration: 6, delay: 0.5 },
  { left: 68, top: 42, duration: 7, delay: 1.2 },
  { left: 26, top: 75, duration: 5.5, delay: 2.1 },
  { left: 12, top: 58, duration: 8, delay: 0.8 },
  { left: 50, top: 64, duration: 6.5, delay: 3.2 },
  { left: 70, top: 54, duration: 7.5, delay: 1.5 },
  { left: 10, top: 27, duration: 5, delay: 2.8 },
  { left: 74, top: 76, duration: 9, delay: 0.3 },
  { left: 2, top: 97, duration: 6, delay: 4.1 },
  { left: 84, top: 3, duration: 5.5, delay: 1.8 },
  { left: 26, top: 9, duration: 8.5, delay: 2.5 },
  { left: 80, top: 31, duration: 7, delay: 3.5 },
  { left: 97, top: 82, duration: 6.5, delay: 0.9 },
  { left: 17, top: 66, duration: 8, delay: 4.5 },
  { left: 77, top: 33, duration: 5, delay: 1.1 },
  { left: 83, top: 43, duration: 9, delay: 2.3 },
  { left: 42, top: 47, duration: 5.5, delay: 3.8 },
  { left: 1, top: 90, duration: 9.5, delay: 0.6 },
  { left: 42, top: 17, duration: 7.5, delay: 4.2 },
  { left: 98, top: 27, duration: 8.5, delay: 1.9 },
];

function FloatingParticles() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {PARTICLE_POSITIONS.map((particle, i) => (
        <div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-rose-500/30"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animation: `floatSlow ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// Animated background
function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0">
      {/* Main gradient orbs */}
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-rose-500/20 blur-3xl animate-glow-pulse" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl animate-glow-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl animate-glow-pulse" style={{ animationDelay: '1s' }} />

      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-50" />

      {/* Noise texture */}
      <div className="noise absolute inset-0" />
    </div>
  );
}

function QuizImage({
  anime,
  alt,
  className,
  showAnswer,
  isCorrect,
}: {
  anime: Anime;
  alt: string;
  className?: string;
  showAnswer?: boolean;
  isCorrect?: boolean;
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 고유한 이미지 URL을 생성 (anime.id를 포함하여 캐시 문제 방지)
  const proxiedImageUrl = anime.image
    ? `/api/image?url=${encodeURIComponent(anime.image)}&id=${anime.id}`
    : "";

  if (!anime.image || hasError) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 p-6 text-center text-sm text-white/80",
          className,
        )}
      >
        <div className="animate-slide-up">
          <div className="mb-3 text-4xl">🎬</div>
          <p className="font-semibold">이미지를 불러오지 못했습니다</p>
          <p className="mt-1 text-xs text-white/60">관리 페이지에서 새 이미지로 바꿔보세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 image-loading" />
      )}
      <Image
        key={`img-${anime.id}-${anime.image}`}
        src={proxiedImageUrl}
        alt={alt}
        fill
        className={cn(
          "object-cover transition-all duration-500",
          isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100",
          showAnswer && (isCorrect ? "brightness-110" : "brightness-75 grayscale-[30%]")
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        unoptimized
      />
      {/* Image overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
    </div>
  );
}

export function WorldCupGame() {
  const [gameState, setGameState] = useState<GameState>("name-input");
  const [playerName, setPlayerName] = useState("");
  const [selectedRound, setSelectedRound] = useState<RoundOption>(8);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [leaderboard, setLeaderboard] = useState<ScoreRecord[]>([]);
  const [leaderboardRound, setLeaderboardRound] = useState<RoundOption>(8);
  const [hints, setHints] = useState<HintState>({
    letterCount: false,
    chosung: false,
    genre: false,
    partial: false,
    year: false,
  });
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);
  const [currentHintsUsed, setCurrentHintsUsed] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [playTime, setPlayTime] = useState(0);

  const availableAnimeCount = getAnimeList().length;
  const currentAnime = animeList[currentIndex];
  const totalQuestions = animeList.length;
  const progress = totalQuestions > 0 ? (currentIndex / totalQuestions) * 100 : 0;
  const remainingHints = MAX_HINTS_PER_QUESTION - currentHintsUsed;
  const canUseHint = remainingHints > 0 && !showAnswer;

  const [isLoading, setIsLoading] = useState(false);
  const [showRankChange, setShowRankChange] = useState(false);

  useEffect(() => {
    const loadInitialLeaderboard = async () => {
      setIsLoading(true);
      const records = await fetchLeaderboard(leaderboardRound);
      setLeaderboard(records);
      setIsLoading(false);
    };
    loadInitialLeaderboard();
  }, [leaderboardRound]);

  const loadLeaderboard = useCallback(async (round: RoundOption) => {
    setLeaderboardRound(round);
    setIsLoading(true);
    setShowRankChange(false);
    const records = await fetchLeaderboard(round);
    setLeaderboard(records);
    setIsLoading(false);
  }, []);

  const startGame = useCallback(() => {
    if (!playerName.trim()) {
      return;
    }

    const shuffled = shuffleArray(getAnimeList());
    const gameAnime = shuffled.slice(0, Math.min(selectedRound, shuffled.length));

    setAnimeList(gameAnime);
    setCurrentIndex(0);
    setUserAnswer("");
    setScore(0);
    setResults([]);
    setShowAnswer(false);
    setIsCorrect(false);
    setHints({
      letterCount: false,
      chosung: false,
      genre: false,
      partial: false,
      year: false,
    });
    setTotalHintsUsed(0);
    setCurrentHintsUsed(0);
    setGameStartTime(Date.now());
    setPlayTime(0);
    setGameState("playing");
  }, [playerName, selectedRound]);

  const activateHint = useCallback((type: keyof HintState) => {
    if (hints[type] || showAnswer || currentHintsUsed >= MAX_HINTS_PER_QUESTION) {
      return;
    }

    setHints((prev) => ({ ...prev, [type]: true }));
    setCurrentHintsUsed((prev) => prev + 1);
    setTotalHintsUsed((prev) => prev + 1);
  }, [hints, showAnswer, currentHintsUsed]);

  const getHintContent = useCallback(() => {
    if (!currentAnime) {
      return [];
    }

    const hintItems: Array<{ label: string; value: string; icon: string }> = [];

    if (hints.letterCount) {
      hintItems.push({
        label: "글자 수",
        value: getLetterCountHint(currentAnime.name),
        icon: "Aa",
      });
    }

    if (hints.chosung) {
      hintItems.push({
        label: "초성",
        value: getChosung(currentAnime.name),
        icon: "ㄱ",
      });
    }

    if (hints.genre && currentAnime.genre) {
      hintItems.push({
        label: "장르",
        value: currentAnime.genre,
        icon: "##",
      });
    }

    if (hints.partial) {
      hintItems.push({
        label: "일부 공개",
        value: getPartialRevealHint(currentAnime.name),
        icon: "**",
      });
    }

    if (hints.year && currentAnime.year) {
      hintItems.push({
        label: "방영 연도",
        value: `${currentAnime.year}년`,
        icon: "YR",
      });
    }

    return hintItems;
  }, [currentAnime, hints]);

  const normalizeAnswer = (value: string) =>
    value
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z가-힣0-9]/g, "");

  const checkAnswer = useCallback(() => {
    if (!currentAnime) {
      return;
    }

    const correct = normalizeAnswer(userAnswer) === normalizeAnswer(currentAnime.name);

    setIsCorrect(correct);
    setShowAnswer(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }

    setResults((prev) => [
      ...prev,
      {
        anime: currentAnime,
        userAnswer,
        isCorrect: correct,
        hintsUsed: currentHintsUsed,
      },
    ]);
  }, [currentAnime, userAnswer, currentHintsUsed]);

  const nextQuestion = useCallback(async () => {
    setShowAnswer(false);
    setUserAnswer("");
    setIsCorrect(false);
    setHints({
      letterCount: false,
      chosung: false,
      genre: false,
      partial: false,
      year: false,
    });
    setCurrentHintsUsed(0);

    if (currentIndex + 1 >= totalQuestions) {
      const endTime = Date.now();
      const totalPlayTime = Math.floor((endTime - gameStartTime) / 1000);

      setPlayTime(totalPlayTime);

      const record: ScoreRecord = {
        playerName,
        score,
        totalQuestions,
        round: selectedRound,
        date: new Date().toLocaleDateString("ko-KR"),
        playTime: totalPlayTime,
      };

      setIsLoading(true);
      const records = await saveScoreToServer(record);
      setLeaderboardRound(selectedRound);
      setLeaderboard(records);
      setShowRankChange(true);
      setIsLoading(false);
      setGameState("result");
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex, totalQuestions, gameStartTime, playerName, score, selectedRound]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") {
      return;
    }

    if (showAnswer) {
      nextQuestion();
      return;
    }

    if (userAnswer.trim()) {
      checkAnswer();
    }
  }, [showAnswer, nextQuestion, userAnswer, checkAnswer]);

  const resetGame = useCallback(() => {
    setGameState("name-input");
    setPlayerName("");
    setSelectedRound(8);
    setAnimeList([]);
    setCurrentIndex(0);
    setScore(0);
    setResults([]);
    setUserAnswer("");
    setShowAnswer(false);
    setIsCorrect(false);
    setHints({
      letterCount: false,
      chosung: false,
      genre: false,
      partial: false,
      year: false,
    });
    setTotalHintsUsed(0);
    setCurrentHintsUsed(0);
    setPlayTime(0);
    setShowRankChange(false);
  }, []);

  // Name input screen
  if (gameState === "name-input") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-start p-4 pt-8">
        <FloatingParticles />
        <AnimatedBackground />

        <div className="relative z-10 mx-auto w-full max-w-md text-center">
          {/* Logo */}
          <div className="mb-10 animate-slide-up-bounce">
            <div className="mb-2 font-orbitron text-sm font-bold uppercase tracking-[0.3em] text-rose-400">
              Ultimate
            </div>
            <h1 className="mb-2 gradient-text-animated text-5xl font-black tracking-tight md:text-7xl">
              ANIME
            </h1>
            <h1 className="mb-4 text-4xl font-black text-white md:text-6xl">
              QUIZ <span className="gradient-text">WORLDCUP</span>
            </h1>
            <p className="text-lg text-zinc-400">
              애니메이션 이미지를 보고
              <br />
              <span className="text-rose-400">제목을 맞혀보세요</span>
            </p>
          </div>

          {/* Game setup card */}
          <div className="mb-6 animate-slide-up glass rounded-3xl p-6 stagger-1">
            <label className="mb-2 block text-left text-sm font-medium text-zinc-400">
              플레이어 이름
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startGame()}
              placeholder="이름을 입력해 주세요"
              className="mb-6 w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-4 text-white placeholder-zinc-500 transition-all duration-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              autoFocus
            />

            <label className="mb-3 block text-left text-sm font-medium text-zinc-400">
              라운드 선택
            </label>
            <div className="flex gap-3">
              {ROUND_OPTIONS.map((round) => (
                <button
                  key={round}
                  onClick={() => setSelectedRound(round)}
                  disabled={availableAnimeCount < round}
                  className={cn(
                    "btn-press flex-1 rounded-xl py-4 text-lg font-bold transition-all duration-300",
                    selectedRound === round
                      ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/30 animate-glow"
                      : "border border-zinc-700/50 bg-zinc-800/50 text-zinc-400 hover:border-rose-500/50 hover:text-white",
                    availableAnimeCount < round && "cursor-not-allowed opacity-40",
                  )}
                >
                  {round}강
                </button>
              ))}
            </div>
            {availableAnimeCount < 32 && (
              <p className="mt-3 text-left text-xs text-zinc-500">
                현재 등록된 문제는 {availableAnimeCount}개라 일부 라운드는 비활성화됩니다.
              </p>
            )}
          </div>

          {/* Start button */}
          <Button
            onClick={startGame}
            disabled={!playerName.trim()}
            size="lg"
            className="btn-press w-full animate-slide-up stagger-2 rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 px-12 py-7 text-xl font-bold text-white shadow-2xl shadow-rose-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-rose-500/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            <span className="mr-2">게임 시작</span>
            <span className="text-2xl">▶</span>
          </Button>

          <p className="mt-6 animate-slide-up stagger-3 text-sm text-zinc-600">
            {selectedRound}개의 문제로 진행됩니다
          </p>
        </div>

        {/* Leaderboard section */}
        <div className="relative z-10 mx-auto mt-10 w-full max-w-md animate-slide-up stagger-4">
          <div className="glass rounded-3xl p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-6 w-1 rounded-full bg-gradient-to-b from-rose-500 to-orange-500" />
              <h3 className="text-xl font-bold text-white">리더보드</h3>
            </div>

            <div className="mb-4 flex gap-2">
              {ROUND_OPTIONS.map((round) => (
                <button
                  key={round}
                  onClick={() => loadLeaderboard(round)}
                  className={cn(
                    "btn-press flex-1 rounded-lg py-2 text-sm font-bold transition-all duration-300",
                    leaderboardRound === round
                      ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md"
                      : "bg-zinc-800/50 text-zinc-400 hover:text-white",
                  )}
                >
                  {round}강
                </button>
              ))}
            </div>

            <Leaderboard
              records={leaderboard}
              isLoading={isLoading}
              showRankChange={false}
            />
          </div>
        </div>
      </div>
    );
  }

  // Result screen
  if (gameState === "result") {
    const percentage = Math.round((score / totalQuestions) * 100);

    return (
      <div className="flex min-h-screen flex-col items-center justify-start p-4 pt-8">
        <FloatingParticles />
        <AnimatedBackground />

        <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
          {/* Header */}
          <div className="mb-8 animate-slide-up-bounce">
            <div className="mb-2 font-orbitron text-sm font-bold uppercase tracking-[0.3em] text-rose-400">
              Game Over
            </div>
            <h1 className="mb-2 text-4xl font-black text-white md:text-5xl">최종 결과</h1>
            <p className="text-zinc-500">{selectedRound}강 결과입니다</p>
          </div>

          {/* Score card */}
          <div className="mb-6 animate-scale-in-bounce glass rounded-3xl p-8">
            <div className="relative mb-4">
              <div className="gradient-text-animated text-8xl font-black md:text-9xl">
                {score}
              </div>
              <div className="text-2xl font-bold text-zinc-500">/ {totalQuestions}</div>
            </div>

            {/* Progress ring visualization */}
            <div className="mb-4 flex items-center justify-center gap-4">
              <div className="relative h-20 w-20">
                <svg className="h-20 w-20 -rotate-90 transform">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-zinc-800"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${percentage * 2.26} 226`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#fb923c" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">{percentage}%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 text-zinc-400">
              {totalHintsUsed > 0 && (
                <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-2">
                  <span className="text-amber-400">💡</span>
                  <span className="text-sm text-amber-400">힌트 {totalHintsUsed}회</span>
                </div>
              )}
              {playTime > 0 && (
                <div className="flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-2">
                  <span className="text-cyan-400">⏱</span>
                  <span className="font-mono text-sm text-cyan-400">
                    {formatPlayTime(playTime)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Player name */}
          <div className="mb-6 animate-slide-up stagger-1 glass-light rounded-2xl p-4">
            <p className="mb-1 text-sm text-zinc-400">플레이어</p>
            <p className="text-2xl font-bold text-white">{playerName}</p>
          </div>

          {/* Results list */}
          <div className="mb-6 max-h-64 animate-slide-up stagger-2 overflow-y-auto glass rounded-3xl p-4">
            <h3 className="mb-4 flex items-center gap-2 text-left font-bold text-white">
              <div className="h-4 w-1 rounded-full bg-gradient-to-b from-rose-500 to-orange-500" />
              문제별 결과
            </h3>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={result.anime.id}
                  className={cn(
                    "flex items-center justify-between rounded-xl p-3 transition-all duration-300",
                    result.isCorrect
                      ? "border border-green-500/30 bg-green-500/10"
                      : "border border-red-500/30 bg-red-500/10",
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-500">
                      {index + 1}
                    </span>
                    <span className="font-medium text-white">{result.anime.name}</span>
                    {result.hintsUsed > 0 && (
                      <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-xs text-amber-400">
                        힌트 {result.hintsUsed}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!result.isCorrect && (
                      <span className="text-sm text-red-400">
                        {result.userAnswer || "(미입력)"}
                      </span>
                    )}
                    <span className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold",
                      result.isCorrect ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    )}>
                      {result.isCorrect ? "O" : "X"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Play again button */}
          <Button
            onClick={resetGame}
            size="lg"
            className="btn-press mb-6 w-full animate-slide-up stagger-3 rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 px-8 py-5 text-lg font-bold text-white shadow-lg shadow-rose-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-rose-500/50"
          >
            다시 플레이
          </Button>

          {/* Leaderboard */}
          <div className="animate-slide-up stagger-4 glass rounded-3xl p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-6 w-1 rounded-full bg-gradient-to-b from-rose-500 to-orange-500" />
              <h3 className="text-xl font-bold text-white">{selectedRound}강 리더보드</h3>
            </div>

            <Leaderboard
              records={leaderboard}
              isLoading={isLoading}
              currentPlayerName={playerName}
              currentScore={score}
              currentPlayTime={playTime}
              showRankChange={showRankChange}
            />
          </div>
        </div>
      </div>
    );
  }

  // Playing screen
  const hintContent = getHintContent();

  return (
    <div className="flex min-h-screen flex-col">
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-10 p-4 md:p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="animate-slide-up">
              <span className="font-orbitron text-xs font-bold uppercase tracking-widest text-rose-400">
                {playerName} · {selectedRound}강
              </span>
              <h2 className="text-xl font-bold text-white md:text-2xl">
                문제 <span className="gradient-text">{currentIndex + 1}</span> / {totalQuestions}
              </h2>
            </div>
            <div className="animate-slide-up text-right stagger-1">
              <span className="text-xs uppercase tracking-wider text-zinc-500">현재 점수</span>
              <p className="gradient-text text-3xl font-bold">{score}점</p>
            </div>
          </div>
          <Progress value={progress} className="h-2 overflow-hidden rounded-full bg-zinc-800" />
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 md:p-6">
        <div className="mx-auto w-full max-w-2xl">
          {currentAnime && (
            <>
              {/* Image card */}
              <div
                className={cn(
                  "relative mx-auto mb-6 aspect-[4/3] w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl transition-all duration-500",
                  showAnswer
                    ? isCorrect
                      ? "ring-4 ring-green-500 shadow-green-500/30 animate-correct-pulse"
                      : "ring-4 ring-red-500 shadow-red-500/30 animate-wrong-shake"
                    : "ring-2 ring-zinc-700/50 hover:ring-rose-500/50",
                )}
              >
                <div className={cn("absolute inset-0 bg-gradient-to-br", currentAnime.color)} />
                <QuizImage
                  key={`${currentAnime.id}-${currentAnime.image}`}
                  anime={currentAnime}
                  alt={currentAnime.name}
                  showAnswer={showAnswer}
                  isCorrect={isCorrect}
                />

                {/* Answer overlay */}
                {showAnswer && (
                  <div
                    className={cn(
                      "absolute inset-0 flex items-center justify-center transition-all duration-300",
                      isCorrect ? "bg-green-500/30" : "bg-red-500/30",
                    )}
                  >
                    <div className="animate-scale-in-bounce text-center">
                      <div
                        className={cn(
                          "mb-2 text-7xl font-black drop-shadow-lg md:text-9xl",
                          isCorrect ? "text-green-400" : "text-red-400",
                        )}
                      >
                        {isCorrect ? "O" : "X"}
                      </div>
                      <div className="rounded-xl bg-black/50 px-6 py-3 backdrop-blur-sm">
                        <p className="text-sm text-zinc-400">정답</p>
                        <p className="text-2xl font-bold text-white">{currentAnime.name}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hint buttons */}
              {!showAnswer && (
                <div className="mb-4 animate-slide-up">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-400">힌트 사용</span>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium transition-all",
                        remainingHints > 0
                          ? "bg-amber-400/10 text-amber-400"
                          : "bg-red-400/10 text-red-400",
                      )}
                    >
                      {remainingHints}/{MAX_HINTS_PER_QUESTION}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { key: "letterCount", label: "글자수", icon: "Aa" },
                      { key: "chosung", label: "초성", icon: "ㄱ" },
                      { key: "genre", label: "장르", icon: "#", disabled: !currentAnime.genre },
                      { key: "year", label: "연도", icon: "YR", disabled: !currentAnime.year },
                      { key: "partial", label: "일부", icon: "**" },
                    ].map((hint) => (
                      <button
                        key={hint.key}
                        onClick={() => activateHint(hint.key as keyof HintState)}
                        disabled={hints[hint.key as keyof HintState] || !canUseHint || hint.disabled}
                        className={cn(
                          "btn-press flex flex-col items-center justify-center gap-1 rounded-xl border py-3 text-xs font-medium transition-all duration-300",
                          hints[hint.key as keyof HintState]
                            ? "border-amber-500/50 bg-amber-500/20 text-amber-400"
                            : !canUseHint || hint.disabled
                              ? "cursor-not-allowed border-zinc-800 bg-zinc-800/30 text-zinc-600"
                              : "border-zinc-700/50 bg-zinc-800/50 text-zinc-400 hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-400",
                        )}
                      >
                        <span className="font-mono text-sm">{hint.icon}</span>
                        <span>{hint.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hint display */}
              {hintContent.length > 0 && !showAnswer && (
                <div className="mb-4 animate-slide-up rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 backdrop-blur-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20">
                      <span className="text-sm text-amber-400">💡</span>
                    </div>
                    <span className="text-sm font-bold text-amber-400">힌트</span>
                  </div>
                  <div className="space-y-2">
                    {hintContent.map((hint, i) => (
                      <div
                        key={hint.label}
                        className="flex items-center gap-3 rounded-xl bg-zinc-900/50 px-4 py-3"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 font-mono text-sm text-amber-400">
                          {hint.icon}
                        </span>
                        <div>
                          <span className="text-xs text-zinc-500">{hint.label}</span>
                          <p className="font-mono text-lg tracking-wider text-white">{hint.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Answer input */}
              <div className="space-y-4">
                <div className="glass rounded-2xl p-4">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="애니메이션 제목을 입력해 주세요"
                    disabled={showAnswer}
                    className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-5 py-4 text-lg text-white placeholder-zinc-500 transition-all duration-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 disabled:opacity-50"
                    autoFocus
                  />
                </div>

                {!showAnswer ? (
                  <Button
                    onClick={checkAnswer}
                    disabled={!userAnswer.trim()}
                    size="lg"
                    className="btn-press w-full rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 py-6 text-xl font-bold text-white shadow-lg shadow-rose-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-rose-500/50 disabled:hover:scale-100"
                  >
                    정답 확인
                  </Button>
                ) : (
                  <Button
                    onClick={nextQuestion}
                    size="lg"
                    className={cn(
                      "btn-press w-full rounded-2xl py-6 text-xl font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02]",
                      isCorrect
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/30 hover:shadow-green-500/50"
                        : "bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/30 hover:shadow-orange-500/50",
                    )}
                  >
                    {currentIndex + 1 >= totalQuestions ? "결과 보기" : "다음 문제"}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
