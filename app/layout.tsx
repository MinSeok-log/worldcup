import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anime Quiz Worldcup",
  description: "애니메이션 이미지를 보고 제목을 맞히는 월드컵 퀴즈 게임",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
