import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SAL代官山 SNSビジュアルジェネレーター",
  description: "SAL代官山のSNS投稿用ビジュアルを簡単に作成",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-sal-cream font-sans text-sal-black min-h-screen">
        {children}
      </body>
    </html>
  );
}
