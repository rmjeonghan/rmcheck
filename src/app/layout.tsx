// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RuleMakers Daily Test",
  description: "통합과학의 모든 것! 룰메이커스 데일리 테스트에서 체계적인 개념 학습, 데일리 테스트, 오답 노트로 실력을 완성하세요. 통합과학 문제 풀이와 개념 정리를 한 번에.",
  keywords: "통합과학, 통합과학 개념 학습, 통합과학 개념, 통합과학 데일리 테스트, 통합과학 Daily Test, 통합과학 개념 문항, 통합과학 문제, RuleMakers Daily Test, RuleMakers 데일리 테스트, 룰메이커스, 룰메이커스 통합과학, 교육 연구소 룰메이커스",
  verification: {
    google: "TKsWF-q76Pbrp1F1KNcciiK9yOT6HhXo-9VRED12STU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 text-slate-800`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}