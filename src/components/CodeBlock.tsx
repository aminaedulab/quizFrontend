"use client";

import { useState } from "react";

interface Props {
  title: string;
  code: string;
  explanation?: string;
}

export default function CodeBlock({ title, code, explanation }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden mb-4">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
        <span className="text-sm text-gray-300 font-mono">{title}</span>
        <button onClick={copy} className="text-xs text-gray-400 hover:text-white transition">
          {copied ? "✅ Copied" : "📋 Copy"}
        </button>
      </div>
      <pre className="bg-gray-900 text-green-300 text-sm p-4 overflow-x-auto leading-relaxed font-mono whitespace-pre">
        {code}
      </pre>
      {explanation && (
        <div className="bg-indigo-50 border-t border-indigo-100 px-4 py-3 text-sm text-indigo-800">
          💡 {explanation}
        </div>
      )}
    </div>
  );
}
