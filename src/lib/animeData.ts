export interface Anime {
  id: string;
  name: string;
  image: string;
  color: string;
  genre?: string;
  year?: number;
}

export interface ScoreRecord {
  playerName: string;
  score: number;
  totalQuestions: number;
  round: number;
  date: string;
  playTime?: number;
  currentRank?: number;
  previousRank?: number | null;
}

export function formatPlayTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const CHOSUNG_LIST = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];

export function getChosung(str: string): string {
  let result = "";

  for (let i = 0; i < str.length; i += 1) {
    const code = str.charCodeAt(i);

    if (code >= 0xac00 && code <= 0xd7a3) {
      const chosungIndex = Math.floor((code - 0xac00) / 588);
      result += CHOSUNG_LIST[chosungIndex];
    } else {
      result += str[i];
    }
  }

  return result;
}

export function getLetterCountHint(str: string): string {
  return str
    .split("")
    .map((char) => (char === " " ? " " : "○"))
    .join("");
}

export function getPartialRevealHint(str: string): string {
  if (str.length <= 2) {
    return str.length === 2 ? `${str[0]}○` : str;
  }

  return `${str[0]}${str
    .slice(1, -1)
    .split("")
    .map((char) => (char === " " ? " " : "○"))
    .join("")}${str[str.length - 1]}`;
}

export const defaultAnimeList: Anime[] = [
  {
    id: "1",
    name: "귀멸의 칼날",
    image: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",
    color: "from-red-600 to-orange-500",
    genre: "액션 / 판타지",
    year: 2019,
  },
  {
    id: "2",
    name: "주술회전",
    image: "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg",
    color: "from-purple-700 to-indigo-600",
    genre: "액션 / 다크 판타지",
    year: 2020,
  },
  {
    id: "3",
    name: "진격의 거인",
    image: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg",
    color: "from-amber-700 to-red-700",
    genre: "액션 / 다크 판타지",
    year: 2013,
  },
  {
    id: "4",
    name: "원피스",
    image: "https://cdn.myanimelist.net/images/anime/1244/138851l.jpg",
    color: "from-blue-600 to-cyan-500",
    genre: "액션 / 모험",
    year: 1999,
  },
  {
    id: "5",
    name: "나루토",
    image: "https://cdn.myanimelist.net/images/anime/1141/142503l.jpg",
    color: "from-orange-500 to-yellow-500",
    genre: "액션 / 닌자",
    year: 2002,
  },
  {
    id: "6",
    name: "스파이 패밀리",
    image: "https://cdn.myanimelist.net/images/anime/1441/122795l.jpg",
    color: "from-pink-600 to-rose-500",
    genre: "액션 / 코미디",
    year: 2022,
  },
  {
    id: "7",
    name: "체인소 맨",
    image: "https://cdn.myanimelist.net/images/anime/1806/126216l.jpg",
    color: "from-red-800 to-rose-700",
    genre: "액션 / 호러",
    year: 2022,
  },
  {
    id: "8",
    name: "장송의 프리렌",
    image: "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg",
    color: "from-sky-500 to-cyan-400",
    genre: "판타지 / 모험",
    year: 2023,
  },
  {
    id: "9",
    name: "나의 히어로 아카데미아",
    image: "https://cdn.myanimelist.net/images/anime/10/78745l.jpg",
    color: "from-green-500 to-emerald-600",
    genre: "액션 / 히어로",
    year: 2016,
  },
  {
    id: "10",
    name: "블리치",
    image: "https://cdn.myanimelist.net/images/anime/3/40451l.jpg",
    color: "from-orange-600 to-red-600",
    genre: "액션 / 판타지",
    year: 2004,
  },
  {
    id: "11",
    name: "헌터x헌터",
    image: "https://cdn.myanimelist.net/images/anime/1337/99013l.jpg",
    color: "from-green-600 to-teal-500",
    genre: "액션 / 모험",
    year: 2011,
  },
  {
    id: "12",
    name: "드래곤볼",
    image: "https://cdn.myanimelist.net/images/anime/1887/92364l.jpg",
    color: "from-orange-400 to-yellow-500",
    genre: "액션 / 모험",
    year: 1986,
  },
  {
    id: "13",
    name: "원펀맨",
    image: "https://cdn.myanimelist.net/images/anime/12/76049l.jpg",
    color: "from-yellow-500 to-red-500",
    genre: "액션 / 코미디",
    year: 2015,
  },
  {
    id: "14",
    name: "도쿄 구울",
    image: "https://cdn.myanimelist.net/images/anime/5/64449l.jpg",
    color: "from-gray-800 to-red-900",
    genre: "액션 / 호러",
    year: 2014,
  },
  {
    id: "15",
    name: "강철의 연금술사",
    image: "https://cdn.myanimelist.net/images/anime/1208/94745l.jpg",
    color: "from-amber-600 to-yellow-600",
    genre: "액션 / 판타지",
    year: 2009,
  },
  {
    id: "16",
    name: "데스노트",
    image: "https://cdn.myanimelist.net/images/anime/9/9453l.jpg",
    color: "from-gray-900 to-slate-800",
    genre: "미스터리 / 스릴러",
    year: 2006,
  },
  {
    id: "17",
    name: "카구야 님은 고백받고 싶어",
    image: "https://cdn.myanimelist.net/images/anime/1295/106551l.jpg",
    color: "from-pink-500 to-rose-400",
    genre: "로맨스 / 코미디",
    year: 2019,
  },
  {
    id: "18",
    name: "소드 아트 온라인",
    image: "https://cdn.myanimelist.net/images/anime/11/39717l.jpg",
    color: "from-blue-700 to-indigo-600",
    genre: "액션 / 판타지",
    year: 2012,
  },
  {
    id: "19",
    name: "리제로",
    image: "https://cdn.myanimelist.net/images/anime/1522/128039l.jpg",
    color: "from-purple-600 to-violet-500",
    genre: "판타지 / 스릴러",
    year: 2016,
  },
  {
    id: "20",
    name: "코드 기아스",
    image: "https://cdn.myanimelist.net/images/anime/5/50331l.jpg",
    color: "from-red-700 to-purple-700",
    genre: "액션 / 메카",
    year: 2006,
  },
  {
    id: "21",
    name: "이세계 삼촌",
    image: "https://m.media-amazon.com/images/M/MV5BZDQxNGJmMGUtYmM4MS00NTY3LWE3ZGUtMTJjY2E2NmE0MzAxXkEyXkFqcGc@._V1_.jpg",
    color: "from-stone-700 to-red-800",
    genre: "코미디 / 판타지",
    year: 2022,
  },
  {
    id: "22",
    name: "도라에몽",
    image: "https://cdn.myanimelist.net/images/anime/3/7062l.jpg",
    color: "from-blue-400 to-sky-500",
    genre: "코미디 / 일상",
    year: 1979,
  },
  {
    id: "23",
    name: "짱구는 못말려",
    image: "https://cdn.myanimelist.net/images/anime/1935/127691l.jpg",
    color: "from-yellow-400 to-orange-400",
    genre: "코미디 / 일상",
    year: 1992,
  },
  {
    id: "24",
    name: "슬램덩크",
    image: "https://cdn.myanimelist.net/images/anime/7/21879l.jpg",
    color: "from-red-500 to-orange-500",
    genre: "스포츠",
    year: 1993,
  },
  {
    id: "25",
    name: "하이큐",
    image: "https://cdn.myanimelist.net/images/anime/7/76014l.jpg",
    color: "from-orange-500 to-amber-500",
    genre: "스포츠",
    year: 2014,
  },
  {
    id: "26",
    name: "블루 록",
    image: "https://cdn.myanimelist.net/images/anime/1258/126929l.jpg",
    color: "from-blue-600 to-indigo-700",
    genre: "스포츠",
    year: 2022,
  },
  {
    id: "27",
    name: "스즈메의 문단속",
    image: "https://cdn.myanimelist.net/images/anime/1065/135231l.jpg",
    color: "from-cyan-400 to-blue-500",
    genre: "판타지 / 드라마",
    year: 2022,
  },
  {
    id: "28",
    name: "너의 이름은",
    image: "https://cdn.myanimelist.net/images/anime/5/87048l.jpg",
    color: "from-sky-400 to-indigo-500",
    genre: "로맨스 / 판타지",
    year: 2016,
  },
  {
    id: "29",
    name: "센과 치히로의 행방불명",
    image: "https://cdn.myanimelist.net/images/anime/6/79597l.jpg",
    color: "from-teal-500 to-green-500",
    genre: "판타지 / 모험",
    year: 2001,
  },
  {
    id: "30",
    name: "이웃집 토토로",
    image: "https://cdn.myanimelist.net/images/anime/4/75923l.jpg",
    color: "from-green-400 to-lime-500",
    genre: "판타지 / 일상",
    year: 1988,
  },
  {
    id: "31",
    name: "모브사이코 100",
    image: "https://cdn.myanimelist.net/images/anime/8/80356l.jpg",
    color: "from-purple-500 to-pink-500",
    genre: "액션 / 코미디",
    year: 2016,
  },
  {
    id: "32",
    name: "바이올렛 에버가든",
    image: "https://cdn.myanimelist.net/images/anime/1795/95088l.jpg",
    color: "from-violet-400 to-purple-500",
    genre: "드라마 / 판타지",
    year: 2018,
  },
  {
    id: "33",
    name: "최애의 아이",
    image: "https://cdn.myanimelist.net/images/anime/1812/134736l.jpg",
    color: "from-pink-400 to-rose-500",
    genre: "드라마 / 미스터리",
    year: 2023,
  },
  {
    id: "34",
    name: "하츠네 미쿠",
    image: "https://m.media-amazon.com/images/I/817k7cGbQbL._AC_UF894,1000_QL80_.jpg",
    color: "from-teal-400 to-cyan-500",
    genre: "음악",
    year: 2007,
  },
  {
    id: "35",
    name: "암살교실",
    image: "https://cdn.myanimelist.net/images/anime/5/75639l.jpg",
    color: "from-yellow-400 to-green-500",
    genre: "액션 / 코미디",
    year: 2015,
  },
  {
    id: "36",
    name: "단다단",
    image: "https://m.media-amazon.com/images/M/MV5BYWFhOWMxNTYtZThiMi00ZmQ5LTlmODktN2QwNzUyZjMyZGQzXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
    color: "from-pink-300 to-rose-400",
    genre: "코미디 / SF",
    year: 2024,
  },
  {
    id: "37",
    name: "에반게리온",
    image: "https://cdn.myanimelist.net/images/anime/1314/108941l.jpg",
    color: "from-purple-600 to-red-600",
    genre: "액션 / 메카",
    year: 1995,
  },
  {
    id: "38",
    name: "포켓몬스터",
    image: "https://i.redd.it/hp59czbg8ila1.jpg",
    color: "from-yellow-400 to-amber-500",
    genre: "모험 / 판타지",
    year: 1997,
  },
  {
    id: "39",
    name: "유유백서",
    image: "https://cdn.myanimelist.net/images/anime/1382/119469l.jpg",
    color: "from-green-500 to-blue-600",
    genre: "액션 / 판타지",
    year: 1992,
  },
  {
    id: "40",
    name: "이누야샤",
    image: "https://cdn.myanimelist.net/images/anime/1565/111305l.jpg",
    color: "from-red-500 to-pink-500",
    genre: "액션 / 로맨스",
    year: 2000,
  },
];

export function getCustomAnimeList(): Anime[] {
  if (typeof window === "undefined") {
    return [];
  }

  const saved = localStorage.getItem("customAnimeList");
  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved) as Anime[];
  } catch {
    return [];
  }
}

export function getAnimeList(): Anime[] {
  return [...defaultAnimeList, ...getCustomAnimeList()];
}

export function saveCustomAnimeList(list: Anime[]): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem("customAnimeList", JSON.stringify(list));
}

export function saveAnimeList(list: Anime[]): void {
  const defaultIds = new Set(defaultAnimeList.map((anime) => anime.id));
  const customOnly = list.filter((anime) => !defaultIds.has(anime.id));
  saveCustomAnimeList(customOnly);
}

// API 기반 리더보드 함수들
export async function fetchLeaderboard(round: number): Promise<ScoreRecord[]> {
  try {
    const response = await fetch(`/api/leaderboard?round=${round}`);

    // JSON이 아닌 응답 처리
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("API가 JSON이 아닌 응답을 반환했습니다.");
      return [];
    }

    const data = await response.json();

    if (data.warning) {
      console.warn(data.warning);
    }

    if (data.success) {
      return data.records;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return [];
  }
}

export async function saveScoreToServer(record: ScoreRecord): Promise<ScoreRecord[]> {
  try {
    const response = await fetch("/api/leaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(record),
    });

    // JSON이 아닌 응답 처리
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("API가 JSON이 아닌 응답을 반환했습니다.");
      return [];
    }

    const data = await response.json();

    if (data.error) {
      console.error("점수 저장 실패:", data.error);
    }

    if (data.success) {
      return data.records;
    }
    return [];
  } catch (error) {
    console.error("Failed to save score:", error);
    return [];
  }
}

// 하위 호환성을 위한 동기 함수 (빈 배열 반환)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getScoreRecords(round: number): ScoreRecord[] {
  return [];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function saveScoreRecord(record: ScoreRecord): void {
  // 더 이상 사용하지 않음 - saveScoreToServer 사용
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
