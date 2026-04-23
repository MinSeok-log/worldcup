"use client";

import { useState } from "react";
import Image from "next/image";
import {
  defaultAnimeList,
  getCustomAnimeList,
  saveCustomAnimeList,
  type Anime,
} from "@/lib/animeData";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const colorOptions = [
  { value: "from-red-600 to-orange-500", label: "빨강" },
  { value: "from-purple-700 to-indigo-600", label: "보라" },
  { value: "from-amber-700 to-red-700", label: "주황" },
  { value: "from-blue-600 to-cyan-500", label: "파랑" },
  { value: "from-orange-500 to-yellow-500", label: "노랑" },
  { value: "from-pink-600 to-rose-500", label: "핑크" },
  { value: "from-green-600 to-emerald-500", label: "초록" },
  { value: "from-sky-500 to-cyan-400", label: "하늘" },
  { value: "from-zinc-700 to-slate-800", label: "회색" },
];

function ImageThumb({
  image,
  alt,
  color,
}: {
  image: string;
  alt: string;
  color: string;
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const displayImageUrl =
    image && !image.startsWith("data:")
      ? `/api/image?url=${encodeURIComponent(image)}`
      : image;

  return (
    <div className={cn("relative h-full w-full overflow-hidden rounded-xl bg-gradient-to-br", color)}>
      {displayImageUrl && !hasError ? (
        <>
          {isLoading && (
            <div className="absolute inset-0 image-loading" />
          )}
          <Image
            src={displayImageUrl}
            alt={alt}
            fill
            className={cn(
              "object-cover transition-all duration-300",
              isLoading ? "opacity-0" : "opacity-100"
            )}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
            unoptimized
          />
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-black/20 p-2 text-center text-[11px] text-white/80">
          이미지 없음
        </div>
      )}
    </div>
  );
}

export function ManageAnime() {
  const [customList, setCustomList] = useState<Anime[]>(() => {
    if (typeof window !== "undefined") {
      return getCustomAnimeList();
    }

    return [];
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAnime, setNewAnime] = useState<Partial<Anime>>({
    name: "",
    image: "",
    color: colorOptions[0].value,
    genre: "",
    year: undefined,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDefaultList, setShowDefaultList] = useState(false);

  const totalCount = defaultAnimeList.length + customList.length;

  const updateNewAnimeImage = (file: File | null) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setNewAnime((prev) => ({ ...prev, image: result }));
    };
    reader.readAsDataURL(file);
  };

  const updateExistingAnimeImage = (id: string, file: File | null) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      handleEdit(id, "image", result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    saveCustomAnimeList(customList);
    alert("저장되었습니다.");
  };

  const handleDelete = (id: string) => {
    if (!confirm("이 문제를 삭제하시겠습니까?")) {
      return;
    }

    const updated = customList.filter((anime) => anime.id !== id);
    setCustomList(updated);
    saveCustomAnimeList(updated);
  };

  const handleAdd = () => {
    if (!newAnime.name?.trim()) {
      alert("애니메이션 이름을 입력해 주세요.");
      return;
    }

    if (!newAnime.image?.trim()) {
      alert("이미지 URL을 넣거나 파일을 업로드해 주세요.");
      return;
    }

    const anime: Anime = {
      id: `custom_${Date.now()}`,
      name: newAnime.name.trim(),
      image: newAnime.image.trim(),
      color: newAnime.color || colorOptions[0].value,
      genre: newAnime.genre?.trim() || undefined,
      year: newAnime.year || undefined,
    };

    const updated = [...customList, anime];
    setCustomList(updated);
    saveCustomAnimeList(updated);
    setNewAnime({
      name: "",
      image: "",
      color: colorOptions[0].value,
      genre: "",
      year: undefined,
    });
    setShowAddForm(false);
  };

  const handleEdit = (id: string, field: keyof Anime, value: string | number | undefined) => {
    setCustomList((prev) =>
      prev.map((anime) => (anime.id === id ? { ...anime, [field]: value } : anime)),
    );
  };

  const handleClearCustom = () => {
    if (!confirm("커스텀 문제를 모두 삭제하시겠습니까?")) {
      return;
    }

    setCustomList([]);
    saveCustomAnimeList([]);
  };

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      {/* Animated background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-rose-500/10 blur-3xl animate-glow-pulse" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl animate-glow-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 grid-pattern opacity-30" />
      </div>

      {/* Header */}
      <div className="mb-8 text-center animate-slide-up-bounce">
        <div className="mb-2 font-orbitron text-xs font-bold uppercase tracking-[0.3em] text-rose-400">
          Management
        </div>
        <h1 className="mb-2 text-3xl font-black text-white md:text-4xl">
          퀴즈 <span className="gradient-text">관리</span>
        </h1>
        <p className="text-zinc-500">커스텀 문제를 추가하고 수정할 수 있습니다</p>
        <p className="mt-2 text-sm text-zinc-600">
          기본 <span className="text-rose-400">{defaultAnimeList.length}</span>개 +
          커스텀 <span className="text-orange-400">{customList.length}</span>개 =
          총 <span className="text-amber-400 font-bold">{totalCount}</span>개
        </p>
      </div>

      {/* Action buttons */}
      <div className="mb-8 flex flex-wrap justify-center gap-3 animate-slide-up stagger-1">
        <Button
          onClick={() => setShowAddForm((prev) => !prev)}
          className="btn-press bg-gradient-to-r from-rose-500 to-orange-500 shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40"
        >
          {showAddForm ? "닫기" : "+ 문제 추가"}
        </Button>
        <Button
          onClick={handleSave}
          variant="outline"
          className="btn-press border-zinc-700 hover:border-rose-500/50 hover:bg-zinc-800"
        >
          저장하기
        </Button>
        <Button
          onClick={() => setShowDefaultList((prev) => !prev)}
          variant="outline"
          className="btn-press border-zinc-700 hover:border-rose-500/50 hover:bg-zinc-800"
        >
          {showDefaultList ? "기본 목록 숨기기" : "기본 목록 보기"}
        </Button>
        {customList.length > 0 && (
          <Button
            onClick={handleClearCustom}
            variant="outline"
            className="btn-press border-red-700 text-red-400 hover:bg-red-950"
          >
            커스텀 전체 삭제
          </Button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="mb-8 glass rounded-3xl p-6 animate-scale-in">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
            <div className="h-5 w-1 rounded-full bg-gradient-to-b from-rose-500 to-orange-500" />
            새 문제 추가
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-zinc-400">정답 제목</label>
              <input
                type="text"
                value={newAnime.name || ""}
                onChange={(e) => setNewAnime({ ...newAnime, name: e.target.value })}
                placeholder="예: 귀멸의 칼날"
                className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 transition-all duration-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">이미지 URL</label>
              <input
                type="text"
                value={newAnime.image || ""}
                onChange={(e) => setNewAnime({ ...newAnime, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 transition-all duration-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              />
              <p className="mt-2 text-xs text-zinc-500">
                외부 이미지가 막히는 경우 아래 파일 업로드를 사용하면 가장 안정적입니다
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">이미지 파일 업로드</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => updateNewAnimeImage(e.target.files?.[0] ?? null)}
                className="w-full rounded-xl border border-dashed border-zinc-700/50 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-400 transition-all duration-300 file:mr-4 file:rounded-lg file:border-0 file:bg-rose-500 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:border-rose-500/50 hover:file:bg-rose-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">장르</label>
                <input
                  type="text"
                  value={newAnime.genre || ""}
                  onChange={(e) => setNewAnime({ ...newAnime, genre: e.target.value })}
                  placeholder="예: 액션 / 판타지"
                  className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 transition-all duration-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-zinc-400">방영 연도</label>
                <input
                  type="number"
                  value={newAnime.year || ""}
                  onChange={(e) =>
                    setNewAnime({
                      ...newAnime,
                      year: e.target.value ? Number.parseInt(e.target.value, 10) : undefined,
                    })
                  }
                  placeholder="예: 2019"
                  min="1900"
                  max="2030"
                  className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-white placeholder-zinc-500 transition-all duration-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">배경 색상</label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setNewAnime({ ...newAnime, color: color.value })}
                    className={cn(
                      "h-10 w-10 rounded-lg bg-gradient-to-br transition-all duration-300 hover:scale-110",
                      color.value,
                      newAnime.color === color.value && "ring-2 ring-white ring-offset-2 ring-offset-zinc-900",
                    )}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {(newAnime.image || newAnime.color) && (
              <div>
                <label className="mb-2 block text-sm text-zinc-400">미리보기</label>
                <div className="h-32 w-40">
                  <ImageThumb
                    key={newAnime.image || "preview"}
                    image={newAnime.image || ""}
                    alt="미리보기"
                    color={newAnime.color || colorOptions[0].value}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleAdd}
              className="btn-press w-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
            >
              추가하기
            </Button>
          </div>
        </div>
      )}

      {/* Default anime list */}
      {showDefaultList && (
        <div className="mb-8 animate-slide-up">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <span className="rounded-lg bg-zinc-700 px-2 py-1 text-xs text-zinc-300">기본</span>
            기본 애니메이션 ({defaultAnimeList.length}개)
          </h2>
          <div className="max-h-96 space-y-2 overflow-y-auto rounded-2xl glass p-4">
            {defaultAnimeList.map((anime, index) => (
              <div
                key={anime.id}
                className="card-hover rounded-xl border border-zinc-700/30 bg-zinc-800/30 p-3 backdrop-blur-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex-shrink-0">
                    <ImageThumb
                      key={`${anime.id}-${anime.image}`}
                      image={anime.image}
                      alt={anime.name}
                      color={anime.color}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-[10px] text-zinc-400">
                        {index + 1}
                      </span>
                      <span className="truncate font-medium text-zinc-300">{anime.name}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      {anime.genre && (
                        <span className="rounded bg-zinc-700/50 px-2 py-0.5 text-xs text-zinc-500">
                          {anime.genre}
                        </span>
                      )}
                      {anime.year && (
                        <span className="rounded bg-zinc-700/50 px-2 py-0.5 text-xs text-zinc-500">
                          {anime.year}년
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-zinc-600">수정 불가</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom anime list */}
      <div className="space-y-4 animate-slide-up stagger-2">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 px-2 py-1 text-xs text-white">커스텀</span>
          내가 추가한 문제 ({customList.length}개)
        </h2>

        {customList.length === 0 ? (
          <div className="glass rounded-3xl py-16 text-center text-zinc-500">
            <div className="mb-4 text-5xl">🎬</div>
            <p className="text-lg">추가한 커스텀 문제가 없습니다</p>
            <p className="mt-2 text-sm text-zinc-600">&quot;+ 문제 추가&quot; 버튼으로 바로 만들 수 있어요</p>
          </div>
        ) : (
          customList.map((anime, index) => (
            <div
              key={anime.id}
              className="card-hover glass rounded-2xl p-4"
            >
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 flex-shrink-0 md:h-24 md:w-24">
                  <ImageThumb
                    key={`${anime.id}-${anime.image}`}
                    image={anime.image}
                    alt={anime.name}
                    color={anime.color}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-500">
                      {index + 1}
                    </span>
                    {editingId === anime.id ? (
                      <input
                        type="text"
                        value={anime.name}
                        onChange={(e) => handleEdit(anime.id, "name", e.target.value)}
                        className="flex-1 rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-1 text-white transition-all duration-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      />
                    ) : (
                      <span className="truncate font-bold text-white">{anime.name}</span>
                    )}
                  </div>

                  {editingId !== anime.id && (anime.genre || anime.year) && (
                    <div className="mb-2 flex items-center gap-2">
                      {anime.genre && (
                        <span className="rounded bg-zinc-700/50 px-2 py-0.5 text-xs text-zinc-400">
                          {anime.genre}
                        </span>
                      )}
                      {anime.year && (
                        <span className="rounded bg-zinc-700/50 px-2 py-0.5 text-xs text-zinc-400">
                          {anime.year}년
                        </span>
                      )}
                    </div>
                  )}

                  {editingId === anime.id && (
                    <div className="mt-2 space-y-2">
                      <input
                        type="text"
                        value={anime.image}
                        onChange={(e) => handleEdit(anime.id, "image", e.target.value)}
                        placeholder="이미지 URL"
                        className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-sm text-white transition-all duration-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => updateExistingAnimeImage(anime.id, e.target.files?.[0] ?? null)}
                        className="w-full rounded-lg border border-dashed border-zinc-700/50 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-rose-500 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-rose-600"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={anime.genre || ""}
                          onChange={(e) => handleEdit(anime.id, "genre", e.target.value || undefined)}
                          placeholder="장르"
                          className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-sm text-white transition-all duration-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                        />
                        <input
                          type="number"
                          value={anime.year || ""}
                          onChange={(e) =>
                            handleEdit(
                              anime.id,
                              "year",
                              e.target.value ? Number.parseInt(e.target.value, 10) : undefined,
                            )
                          }
                          placeholder="방영 연도"
                          min="1900"
                          max="2030"
                          className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-2 text-sm text-white transition-all duration-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => handleEdit(anime.id, "color", color.value)}
                            className={cn(
                              "h-6 w-6 rounded-md bg-gradient-to-br transition-all duration-200 hover:scale-110",
                              color.value,
                              anime.color === color.value && "ring-2 ring-white",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-shrink-0 gap-2">
                  {editingId === anime.id ? (
                    <Button
                      onClick={() => {
                        setEditingId(null);
                        saveCustomAnimeList(customList);
                      }}
                      size="sm"
                      className="btn-press bg-green-600 hover:bg-green-700"
                    >
                      완료
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setEditingId(anime.id)}
                      size="sm"
                      variant="outline"
                      className="btn-press border-zinc-700 hover:border-rose-500/50 hover:bg-zinc-800"
                    >
                      수정
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDelete(anime.id)}
                    size="sm"
                    variant="outline"
                    className="btn-press border-red-700 text-red-400 hover:bg-red-950"
                  >
                    삭제
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <p className="mt-10 text-center text-sm text-zinc-600 animate-slide-up stagger-3">
        총 <span className="gradient-text font-bold">{totalCount}</span>개의 문제가 있습니다 ·
        기본 {defaultAnimeList.length}개 · 커스텀 {customList.length}개
      </p>
    </div>
  );
}
