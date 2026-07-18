# book_shelf

Interactive 2D visual bookshelf for a personal catalogue (Kindle + physical).

Part of the **book-catalog** ecosystem:

| Repo | Role |
|---|---|
| [book_core](https://github.com/mikekyle/book_core) | API + Postgres + enrichment / projections |
| **book_shelf** (this repo) | Static SPA on GitHub Pages |
| [book_bot](https://github.com/mikekyle/book_bot) | Telegram (Phase 2) |

## Status

**Planning / skeleton only.** No application code yet. Start from [`PLANNING.md`](PLANNING.md).

## Agent entrypoint

Read [`CLAUDE.md`](CLAUDE.md) then [`PLANNING.md`](PLANNING.md). Consume only the read APIs documented in [`api-contracts.md`](api-contracts.md) (mirror of `book_core`).

## Hosting

GitHub Pages. Public catalogue is acceptable; **never** put API write tokens or OpenRouter keys in this frontend.
