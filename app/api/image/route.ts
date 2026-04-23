import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function isSafeRemoteUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const remoteUrl = request.nextUrl.searchParams.get("url");

  if (!remoteUrl || !isSafeRemoteUrl(remoteUrl)) {
    return new NextResponse("Invalid image url", { status: 400 });
  }

  try {
    const response = await fetch(remoteUrl, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
        accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        referer: "https://myanimelist.net/",
        "accept-language": "en-US,en;q=0.9",
      },
      cache: "no-store", // 서버 캐시 비활성화 - 항상 새로 가져오기
    });

    if (!response.ok) {
      return new NextResponse("Failed to load image", { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "content-type": contentType,
        "cache-control": "no-cache, no-store, must-revalidate",
        "pragma": "no-cache",
        "expires": "0",
      },
    });
  } catch {
    return new NextResponse("Failed to fetch image", { status: 502 });
  }
}
