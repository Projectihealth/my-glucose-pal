# My Glucose Pal Monorepo

The project now follows a simple "apps" layout so the React client and Flask backend can evolve side by side without tripping over each other. Use the table below to find the piece you need:

| Path | Description |
| --- | --- |
| `apps/frontend` | Vite + React UI (shadcn/ui, Lovable component tagger, static pattern assets). |
| `apps/backend/cgm_butler` | Flask + SQLite service that powers logging, CGM data processing, digital avatar endpoints, and pattern identification. |
| `apps/backend/data` | Large assets that do not belong in source folders (sample `cgm_butler_full.db` and `example_user` exports). |

## Working with the frontend

```bash
cd apps/frontend
npm install           # once
npm run dev           # http://localhost:8080
npm run build         # output written to apps/frontend/dist
```

Key points:
- Static CSVs used by `usePatternOverlays` now live at `apps/frontend/public/patternshapes`, so they deploy with the rest of the public bundle.
- Existing Vite config, tsconfig files, ESLint config, etc. moved with the app so relative imports (`@/…`) continue to work as before.

## Working with the backend

```bash
cd apps/backend/cgm_butler
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# optional: point to the bigger sample DB we moved to apps/backend/data
export CGM_DB_PATH="../data/cgm_butler_full.db"
python dashboard/app.py
```

Notes:
- The original backend README is still available at `apps/backend/cgm_butler/README.md` with detailed module docs.
- The `example_user` exports are stored under `apps/backend/data/example_user` so they are easy to share or replace.

## Why this layout?

- Keeps frontend and backend dependencies isolated (`node_modules` lives under `apps/frontend`, Python packages stay in their own virtualenv).
- Makes it obvious where to add new services or shared utilities in the future (`apps/` can house more targets without bloating the root).
- Lets CI/CD and tooling address each app independently (e.g., `npm` workflows vs. Python workflows).

Feel free to extend this structure (e.g., `/apps/mobile`, `/packages/shared-ui`) as the project grows.
