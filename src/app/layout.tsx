import type { Metadata, Viewport } from "next";
import InstallPrompt from "@/components/InstallPrompt";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import SplashScreen from "@/components/SplashScreen";
import "./globals.css";

export const metadata: Metadata = {
  title: "우리동네 밥친구",
  description: "근처 가맹점·편의점 지도와 편의점 상품 영양 안내",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "든든이",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  // interactiveWidget을 지정하지 않으면 브라우저 기본 동작(키보드가 뜰 때 레이아웃
  // 자체가 줄어듦)을 그대로 쓴다 — 그래야 dvh 기반 레이아웃과 fixed 위치들이 키보드
  // 바로 위로 자연스럽게 따라 올라온다. 하단 탭바처럼 계속 떠 있으면 안 되는 전역 UI는
  // useKeyboardInset으로 감지해 개별적으로 숨긴다.
  themeColor: "#fdf8ef",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
      </head>
      <body className="flex min-h-dvh flex-col bg-neutral-200 font-sans sm:items-center sm:justify-center sm:py-8">
        <div className="relative flex w-full flex-1 flex-col bg-cream sm:h-[880px] sm:max-h-[92dvh] sm:w-[430px] sm:flex-none sm:overflow-y-auto sm:rounded-[2.5rem] sm:shadow-2xl sm:ring-1 sm:ring-black/10">
          {children}
          <InstallPrompt />
          <SplashScreen />
          <ServiceWorkerRegister />
        </div>
      </body>
    </html>
  );
}
