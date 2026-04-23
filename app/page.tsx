"use client";

import { WorldCupGame } from "@/components/WorldCupGame";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 noise">
      <main>
        <WorldCupGame />
      </main>
    </div>
  );
}
