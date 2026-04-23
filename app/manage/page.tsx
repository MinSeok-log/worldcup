"use client";

import { useState } from "react";
import { ManageAnime } from "@/components/ManageAnime";

const ADMIN_PASSWORD = "1234";

export default function ManagePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError(false);
      return;
    }

    setError(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 backdrop-blur-lg">
          <h1 className="mb-2 text-center text-2xl font-bold text-white">관리자 페이지</h1>
          <p className="mb-6 text-center text-sm text-zinc-500">비밀번호를 입력해 주세요.</p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="비밀번호"
            className="mb-4 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            autoFocus
          />

          {error && <p className="mb-4 text-center text-sm text-red-400">비밀번호가 올바르지 않습니다.</p>}

          <button
            onClick={handleLogin}
            className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 py-3 font-bold text-white transition-all hover:from-rose-600 hover:to-orange-600"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-rose-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/5 blur-3xl" />
      </div>

      <main className="relative z-10 pt-8">
        <ManageAnime />
      </main>
    </div>
  );
}
