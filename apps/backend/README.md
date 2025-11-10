# Backend workspace

```
apps/backend/
├── cgm_butler/          # Flask + SQLite application (see its README for details)
└── data/
    ├── cgm_butler_full.db   # Larger sample DB (set CGM_DB_PATH to use it)
    └── example_user/        # Exported readings + rules for demos/tests
```

The backend code assumes relative paths by default (e.g., `database/cgm_butler.db`).
Set `CGM_DB_PATH` when you want to point at one of the copies in `data/`:

```bash
export CGM_DB_PATH="apps/backend/data/cgm_butler_full.db"
python apps/backend/cgm_butler/dashboard/app.py
```

Feel free to drop additional datasets or environment-specific `*.db` files into
`apps/backend/data/` to keep the source tree clean.
