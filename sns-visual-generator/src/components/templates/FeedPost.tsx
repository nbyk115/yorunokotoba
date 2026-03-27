"use client";

interface FeedPostProps {
  salonName: string;
  copy: string;
  date: string;
}

export default function FeedPost({ salonName, copy, date }: FeedPostProps) {
  return (
    <div
      id="feed-canvas"
      style={{ width: 1080, height: 1080 }}
      className="relative overflow-hidden bg-sal-black text-sal-white flex flex-col"
    >
      {/* 上部ゴールドライン */}
      <div className="h-1 bg-sal-gold w-full" />

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col items-center justify-center px-20">
        {/* サロン名 */}
        <p
          className="font-sans tracking-[0.4em] text-sal-gold uppercase"
          style={{ fontSize: 28 }}
        >
          {salonName}
        </p>

        {/* 装飾ライン */}
        <div className="flex items-center gap-4 my-10">
          <div className="w-16 h-px bg-sal-gold" />
          <div className="w-2 h-2 rotate-45 border border-sal-gold" />
          <div className="w-16 h-px bg-sal-gold" />
        </div>

        {/* メインコピー */}
        <h1
          className="font-serif text-center leading-relaxed text-sal-cream whitespace-pre-line"
          style={{ fontSize: 64 }}
        >
          {copy}
        </h1>

        {/* 装飾ライン下 */}
        <div className="flex items-center gap-4 my-10">
          <div className="w-16 h-px bg-sal-gold" />
          <div className="w-2 h-2 rotate-45 border border-sal-gold" />
          <div className="w-16 h-px bg-sal-gold" />
        </div>

        {/* 日付 */}
        <p
          className="font-sans tracking-[0.2em] text-sal-gray"
          style={{ fontSize: 24 }}
        >
          {date}
        </p>
      </div>

      {/* 下部ゴールドライン */}
      <div className="h-1 bg-sal-gold w-full" />

      {/* コーナー装飾 */}
      <div className="absolute top-6 left-6 w-12 h-12 border-t border-l border-sal-gold" />
      <div className="absolute top-6 right-6 w-12 h-12 border-t border-r border-sal-gold" />
      <div className="absolute bottom-6 left-6 w-12 h-12 border-b border-l border-sal-gold" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-b border-r border-sal-gold" />
    </div>
  );
}
