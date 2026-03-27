"use client";

import { useState } from "react";

interface ExportButtonProps {
  targetId: string;
  fileName?: string;
}

export default function ExportButton({
  targetId,
  fileName = "sal-daikanyama-post",
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const element = document.getElementById(targetId);
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        backgroundColor: null,
        width: 1080,
        height: 1080,
      });

      const link = document.createElement("a");
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="w-full py-4 bg-sal-gold hover:bg-sal-gold-light text-sal-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {exporting ? "書き出し中..." : "PNGで書き出し"}
    </button>
  );
}
