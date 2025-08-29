import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import PageTransition from "@/components/PageTransition";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RuleMakers App",
  description: "RuleMakers 학습 플랫폼",
};

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthProvider>
          {/* react-hot-toast의 Toaster를 최상단에 추가하여 앱 어디서든 알림을 띄울 수 있게 합니다. */}
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
            }}
          />
          <div className="max-w-4xl mx-auto">
            <Header />
            <main className="p-4 sm:p-6 lg:p-8">
              <PageTransition>{children}</PageTransition>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
