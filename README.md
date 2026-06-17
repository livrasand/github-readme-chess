<div align="center">
  <img src="./readmechess-logo.png" width="120" alt="ReadmeChess logo" />
  <h1>ReadmeChess</h1>
  <p><strong>Play chess directly on your GitHub profile README.</strong></p>
  <p>
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#how-it-works">How It Works</a> •
    <a href="#self-hosting">Self-Hosting</a>
  </p>
  <p>
    <a href="https://github-readme-chess.vercel.app/">
      <img src="https://img.shields.io/badge/try%20it-here-739552?style=flat-square" alt="Try it" />
    </a>
  </p>
</div>

---

## What is this?

ReadmeChess turns your GitHub profile into a live chess board. Add one line of Markdown to your `README.md` and suddenly every visitor can see — and play — a chess game right from your profile page.

The board is rendered as a dynamic SVG. GitHub displays it natively. Clicks on squares are translated into moves via URL parameters. No JavaScript required on the viewer side.

---

## Features

- **Interactive chess in your README** — visitors click squares to make moves, all through GitHub's native SVG rendering
- **Live game state** — the board updates in real time as moves are made
- **GitHub OAuth** — sign in with your GitHub account to manage your games
- **Multiplayer** — challenge anyone; they just need to visit your profile and click
- **Full chess rules** — legal move validation, check, checkmate, stalemate (powered by [chess.js](https://github.com/jhlywa/chess.js))
- **Beautiful SVG rendering** — clean, scalable vector pieces with proper coloring
- **Dashboard** — track all your active and finished games

---

## Quick Start

### 1. Sign in

Go to [ReadmeChess](https://github-readme-chess.vercel.app/) and sign in with your GitHub account.

### 2. Copy the code

After signing in, your dashboard shows a ready-to-paste Markdown snippet:

```markdown
[![ReadmeChess](https://github-readme-chess.vercel.app/api/chessboard?user=YOUR_USERNAME)](https://github-readme-chess.vercel.app/dashboard)
```

### 3. Add it to your README

Paste that line into your GitHub profile `README.md`. Commit and push. Done.

Now every visitor to your profile sees your chess board. They can click any square to make a move — the game updates live, right inside your README.

## How It Works

```
Visitor clicks square
        │
        ▼
GitHub profile ──► github-readme-chess.vercel.app/api/move?gameId=...&square=e2
                        │
                        ├── GitHub OAuth (if not authenticated)
                        ├── chess.js validates the move
                        ├── Game state saved to Neon (PostgreSQL)
                        │
                        ▼
SVG rendered with updated board ──► Visitor sees the result
```

The entire interaction happens through URL-based requests:

1. **`/api/chessboard?user=username`** — generates an SVG of the current game board for a user
2. **`/api/move?gameId=...&square=e2`** — processes a square click (select piece, then select destination)
3. **`/api/auth`** — GitHub OAuth flow for authentication

No client-side JavaScript is needed. The board is a pure SVG that GitHub renders natively in READMEs.

## Credits

- Inspired by [marcizhu/readme-chess](https://github.com/marcizhu/readme-chess) — piece SVG paths are based on their work
- Built with [Next.js](https://nextjs.org/), [chess.js](https://github.com/jhlywa/chess.js), and [Neon](https://neon.tech/)

---

<div align="center">
  <sub>Made with ♟️ and ☕</sub>
  <br />
  <a href="https://vercel.com">
    <img src="./public/vercel.svg" width="100" alt="Powered by Vercel" />
  </a>
</div>
