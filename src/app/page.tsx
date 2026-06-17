import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-deep-charcoal">
      {/* Navigation bar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-off-white tracking-tight">
            Readme<span className="text-chess-green">Chess</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/api/auth"
            className="inline-flex items-center px-4 py-2 bg-chess-green text-white text-sm font-semibold rounded-md hover:bg-chess-green-hover active:bg-chess-green-active transition-colors leading-[15.99px]"
          >
            Iniciar sesion
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-[42px] font-extrabold leading-12 text-white tracking-tight">
              Ajedrez en tu
              <br />
              <span className="text-chess-green">README</span> de GitHub
            </h1>
            <p className="mt-4 text-base text-text-secondary leading-5 max-w-lg">
              Convierte tu perfil de GitHub en un tablero de ajedrez
              interactivo. Cada visita genera un SVG en vivo con el estado
              actual de tu partida.
            </p>
            <div className="flex flex-wrap gap-3 mt-8 justify-center lg:justify-start">
              <Link
                href="/api/auth"
                className="inline-flex items-center px-6 py-3 bg-chess-green text-white text-sm font-semibold rounded-md hover:bg-chess-green-hover active:bg-chess-green-active transition-colors leading-[15.99px]"
              >
                Comenzar ahora
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center px-6 py-3 bg-transparent text-text-secondary text-sm font-semibold rounded-md border border-white/30 hover:bg-white/10 hover:text-white hover:border-white/50 transition-all leading-[15.99px]"
              >
                Como funciona
              </a>
            </div>
          </div>

          {/* Preview board */}
          <div className="shrink-0">
            <div className="bg-near-black rounded-lg p-4 shadow-card">
              <svg
                width="460"
                height="460"
                viewBox="0 0 460 460"
                className="rounded-md"
              >
                {/* Chess.com-style board preview */}
                {Array.from({ length: 8 }, (_, row) =>
                  Array.from({ length: 8 }, (_, col) => {
                    const isLight = (row + col) % 2 === 0;
                    const pieces = [
                      ["r", "n", "b", "q", "k", "b", "n", "r"],
                      ["p", "p", "p", "p", "p", "p", "p", "p"],
                      ["", "", "", "", "", "", "", ""],
                      ["", "", "", "", "", "", "", ""],
                      ["", "", "", "", "", "", "", ""],
                      ["", "", "", "", "", "", "", ""],
                      ["P", "P", "P", "P", "P", "P", "P", "P"],
                      ["R", "N", "B", "Q", "K", "B", "N", "R"],
                    ];
                    const piece = pieces[row][col];
                    const unicode: Record<string, string> = {
                      K: "\u2654",
                      Q: "\u2655",
                      R: "\u2656",
                      B: "\u2657",
                      N: "\u2658",
                      P: "\u2659",
                      k: "\u265A",
                      q: "\u265B",
                      r: "\u265C",
                      b: "\u265D",
                      n: "\u265E",
                      p: "\u265F",
                    };
                    return (
                      <g key={`${row}-${col}`}>
                        <rect
                          x={col * 57.5}
                          y={row * 57.5}
                          width="57.5"
                          height="57.5"
                          fill={isLight ? "#EBECD0" : "#739552"}
                        />
                        {piece && (
                          <text
                            x={col * 57.5 + 28.75}
                            y={row * 57.5 + 30.75}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="34"
                            fontFamily="serif"
                            fontWeight="500"
                            fill={isLight ? "#312E2B" : "#EBECD0"}
                          >
                            {unicode[piece]}
                          </text>
                        )}
                      </g>
                    );
                  }),
                )}
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="bg-near-black py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-[36px] font-extrabold leading-10 text-white text-center mb-12">
            Como funciona
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-deep-charcoal rounded-lg p-5 shadow-card">
              <div className="w-10 h-10 bg-chess-green/20 rounded-md flex items-center justify-center mb-4">
                <span className="text-chess-green font-extrabold text-sm">
                  1
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-white leading-4">
                Conecta con GitHub
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-5">
                Inicia sesion con tu cuenta de GitHub para crear tu tablero
                personalizado.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-deep-charcoal rounded-lg p-5 shadow-card">
              <div className="w-10 h-10 bg-chess-green/20 rounded-md flex items-center justify-center mb-4">
                <span className="text-chess-green font-extrabold text-sm">
                  2
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-white leading-4">
                Copia el codigo
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-5">
                Copia el codigo Markdown que generamos para ti y pegalo en tu
                README.md.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-deep-charcoal rounded-lg p-5 shadow-card">
              <div className="w-10 h-10 bg-chess-green/20 rounded-md flex items-center justify-center mb-4">
                <span className="text-chess-green font-extrabold text-sm">
                  3
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-white leading-4">
                Juega desde GitHub
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-5">
                Cualquier visitante puede hacer clic en tu tablero y comenzar
                una partida.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Markdown Code Example */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-deep-charcoal rounded-lg p-6 shadow-card border border-white/10">
          <h3 className="text-sm font-extrabold text-white leading-4">
            Codigo para tu README
          </h3>
          <p className="mt-2 text-sm text-text-secondary leading-5 mb-4">
            Copia y pega esto en tu repositorio:
          </p>
          <pre className="bg-near-black text-bright-mint p-4 rounded-md text-sm overflow-x-auto border border-white/5 font-mono">
            {`[![ReadmeChess](https://github-readme-chess.vercel.app/api/chessboard?user=TU_USUARIO)](https://github-readme-chess.vercel.app/dashboard)`}
          </pre>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-text-tertiary">
            Hecho con Next.js, chess.js, Neon y cariño.
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            Iconos de piezas obtenidos de{" "}
            <a
              href="https://github.com/marcizhu/readme-chess"
              target="_blank"
              rel="noopener noreferrer"
              className="text-chess-green hover:underline"
            >
              marcizhu/readme-chess
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
