"use client";

import { useState } from "react";
import FeedPost from "@/components/templates/FeedPost";
import TextEditor from "@/components/ui/TextEditor";
import ExportButton from "@/components/ui/ExportButton";

export default function Home() {
  const [salonName, setSalonName] = useState("SAL DAIKANYAMA");
  const [copy, setCopy] = useState("あなたらしさを\n引き出す空間");
  const [date, setDate] = useState("2026.04.01 — GRAND OPEN");

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-serif text-sal-charcoal">
            SAL代官山 SNSビジュアルジェネレーター
          </h1>
          <p className="text-sm text-sal-gray mt-2">
            Feed投稿テンプレート（1080 x 1080）
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">
          {/* プレビュー（縮小表示） */}
          <div className="flex-shrink-0">
            <p className="text-xs text-sal-gray mb-2 text-center">プレビュー</p>
            <div
              className="border border-gray-200 rounded-lg overflow-hidden shadow-lg"
              style={{
                width: 540,
                height: 540,
              }}
            >
              <div style={{ transform: "scale(0.5)", transformOrigin: "top left" }}>
                <FeedPost
                  salonName={salonName}
                  copy={copy}
                  date={date}
                />
              </div>
            </div>
          </div>

          {/* 編集パネル */}
          <div className="w-full lg:w-80 space-y-8">
            <TextEditor
              salonName={salonName}
              copy={copy}
              date={date}
              onSalonNameChange={setSalonName}
              onCopyChange={setCopy}
              onDateChange={setDate}
            />

            <ExportButton targetId="feed-canvas" fileName="sal-daikanyama-feed" />

            <p className="text-xs text-sal-gray text-center">
              書き出しサイズ: 1080 x 1080px（Instagram推奨）
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
