# Repository Guidelines

## Project Structure & Module Organization
This repository is a static GitHub Pages site for MKS language content. Top-level `*.html` files are page entry points such as `index.html`, `docs.html`, `examples.html`, and `roadmap.html`. Shared assets live under `assets/`: `assets/css/` for page-specific and base styles, `assets/js/` for client-side behavior, and `assets/data/` for JSON-backed content and i18n data. Keep related page files aligned: if you add `foo.html`, expect matching updates in CSS, JS, navigation, and `site.json` when copy is translated.

## Build, Test, and Development Commands
There is no build pipeline in this repo; files are served directly.

- `python3 -m http.server 8000`
  Runs a simple local server for previewing the site at `http://localhost:8000`.
- `rg --files assets`
  Fast way to inspect asset files before editing.
- `git status`
  Review pending changes before committing.

GitHub Actions runs CodeQL from `.github/workflows/codeql.yml`; there is no separate CI build step.

## Coding Style & Naming Conventions
Use 2-space indentation in HTML, CSS, JS, and JSON to match the existing files. Prefer semantic, page-scoped names such as `home.js`, `docs-page.js`, and `roadmap.css`. Keep shared behavior in `assets/js/common.js` or `assets/css/base.css`; keep page-only logic in the corresponding page file. Use lowercase kebab-case for CSS classes and filenames. Preserve existing cache-busting query strings on asset links when shipping changed frontend files.

## Testing Guidelines
This repo does not include an automated test suite. Validate changes by serving the site locally and checking the affected pages in desktop and mobile widths. When editing `assets/data/*.json`, verify both English and Russian content paths still render correctly and that language switching, navigation, and copy buttons continue to work.

## Commit & Pull Request Guidelines
Recent history uses short, imperative commit subjects such as `Fix docs rerender listeners and stabilize RU i18n` and `Add read() in docs`. Follow that pattern: one concise summary line, focused on user-visible change. PRs should include a brief description, affected pages, linked issues when applicable, and screenshots or short recordings for layout or interaction changes.
