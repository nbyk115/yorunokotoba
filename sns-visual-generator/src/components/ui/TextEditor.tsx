"use client";

interface TextEditorProps {
  salonName: string;
  copy: string;
  date: string;
  onSalonNameChange: (value: string) => void;
  onCopyChange: (value: string) => void;
  onDateChange: (value: string) => void;
}

export default function TextEditor({
  salonName,
  copy,
  date,
  onSalonNameChange,
  onCopyChange,
  onDateChange,
}: TextEditorProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-sal-charcoal">テキスト編集</h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="salon-name"
            className="block text-sm font-medium text-sal-gray mb-1"
          >
            サロン名
          </label>
          <input
            id="salon-name"
            type="text"
            value={salonName}
            onChange={(e) => onSalonNameChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-sal-black focus:outline-none focus:ring-2 focus:ring-sal-gold focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="copy-text"
            className="block text-sm font-medium text-sal-gray mb-1"
          >
            メインコピー
          </label>
          <textarea
            id="copy-text"
            value={copy}
            onChange={(e) => onCopyChange(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-sal-black focus:outline-none focus:ring-2 focus:ring-sal-gold focus:border-transparent resize-none"
          />
          <p className="text-xs text-sal-gray mt-1">
            改行で複数行に分割できます
          </p>
        </div>

        <div>
          <label
            htmlFor="date-text"
            className="block text-sm font-medium text-sal-gray mb-1"
          >
            日付・サブテキスト
          </label>
          <input
            id="date-text"
            type="text"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-sal-black focus:outline-none focus:ring-2 focus:ring-sal-gold focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
