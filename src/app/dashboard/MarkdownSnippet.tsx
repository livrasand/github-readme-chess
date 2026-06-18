"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "readmechess_limit";

interface Props {
  username: string;
}

export default function MarkdownSnippet({ username }: Props) {
  const [limit, setLimit] = useState<string>("");

  // Load saved limit on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setLimit(saved);
  }, []);

  function handleChange(value: string) {
    setLimit(value);
    if (value) {
      localStorage.setItem(STORAGE_KEY, value);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const baseUrl = "https://github-readme-chess.vercel.app";
  const limitParam = limit ? `&limit=${limit}` : "";
  const markdown = `[![ReadmeChess](${baseUrl}/api/chessboard?user=${username}${limitParam})](${baseUrl}/play?user=${username})`;

  return (
    <div className="bg-near-black rounded-lg p-6 shadow-card mb-10">
      <h2 className="text-sm font-extrabold text-white leading-4">
        Tu codigo Markdown
      </h2>
      <p className="mt-2 text-sm text-text-secondary leading-5 mb-4">
        Copia esto en tu{" "}
        <code className="bg-deep-charcoal text-bright-mint px-1.5 py-0.5 rounded-sm text-xs font-mono">
          README.md
        </code>
        :
      </p>

      {/* Limit selector */}
      <div className="flex items-center gap-3 mb-4">
        <label
          htmlFor="limit-select"
          className="text-sm text-text-secondary leading-5"
        >
          Partidas a mostrar:
        </label>
        <select
          id="limit-select"
          value={limit}
          onChange={(e) => handleChange(e.target.value)}
          className="bg-deep-charcoal text-white text-sm border border-white/20 rounded-md px-3 py-1.5 focus:outline-none focus:border-chess-green font-mono"
        >
          <option value="">Todas</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </div>

      <pre className="bg-deep-charcoal text-bright-mint p-4 rounded-md text-sm overflow-x-auto border border-white/5 font-mono whitespace-pre-wrap break-all">
        {markdown}
      </pre>
    </div>
  );
}
