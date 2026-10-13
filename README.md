# AGRIS — Agricultural Intelligence System

An advisory-first precision agriculture platform, beginning with Nigeria-focused examples.

## Current milestone

Current milestone: React web app connected to FastAPI and MySQL health checks.
MySQL replaces the blueprint's initial SQLite choice at the user's request.
The frontend is an initial workspace page. No trained model or farm CRUD exists yet.

## Principles

- Recommendations must state uncertainty, missing inputs and limitations.
- Dataset provenance, units and model evaluation must be documented.
- Simulated data and geometry must be clearly labeled.
- AGRIS must never automatically operate equipment.

## Structure

- `backend/`: API, storage and application services
- `frontend/`: farmer dashboard
- `ml/`: training, inference and evaluation
- `data/`: local datasets (excluded from Git)
- `tests/`: cross-component tests
- `docs/`: project documentation

## Windows setup

From this directory in PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe --version
```

Optional activation:

```powershell
.\.venv\Scripts\Activate.ps1
```

Commands can use `.\.venv\Scripts\python.exe` directly if activation is unavailable.
## Backend

Install the verified dependency versions from the repository root:

```powershell
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
```

Start the API (keep this terminal open):

```powershell
.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

Open http://127.0.0.1:8000/health. Expected response:

```json
{"status":"ok","service":"AGRIS"}
```

Interactive API documentation is available at http://127.0.0.1:8000/docs.
The health endpoint checks API liveness only; it does not check models or storage.
Stop the server with Ctrl+C.

Run the backend test:

```powershell
.\.venv\Scripts\python.exe -m pytest backend/tests -q
```

## Local MySQL connection

AGRIS uses SQLAlchemy with PyMySQL, your local `root` account, and a separate
`agris` database. The ignored `.env` file contains the connection settings;
enter your current password in `MYSQL_PASSWORD`. Quote passwords containing
`#` or spaces. Do not URL-encode the password: SQLAlchemy's `URL.create()`
handles special characters such as `@` automatically.

If setting up a new checkout, copy `.env.example` to `.env` first.
Keep your MySQL service running (for XAMPP, start MySQL in its control panel).
Create the empty database from PowerShell; `-p` prompts privately for your password:

```powershell
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS agris CHARACTER SET utf8mb4;"
```

Check the connection without starting the API:

```powershell
.\.venv\Scripts\python.exe -m backend.app.database
```

Expected output: `MySQL connection successful.`

After configuring `.env`, run the API and open
http://127.0.0.1:8000/health/database. A successful check returns
`{"status":"ok","service":"AGRIS"}`. An unavailable database returns HTTP 503
with a generic message; connection credentials are never returned in the response.
`/health` remains an independent API liveness check.

`backend/app/database.py` supplies the engine, declarative model base and a
request-scoped session dependency. It does not create tables on application startup.
Farm models and CRUD will be added in a later milestone. Existing databases
such as `empdb` are not used or modified.

The backend tests validate the health route, password handling and database
failure responses without needing a live MySQL server.

## Web app

The frontend uses React, TypeScript and Vite with responsive CSS. It shows actual
API and database connection checks, loading states, unavailable states and a
refresh button. Farm registration and crop recommendations are marked as planned.
The field illustration is decorative artwork, not surveyed land or farm data.

Keep the backend running on port 8000 using the command above. In a second
PowerShell terminal, run:

```powershell
Set-Location frontend
npm.cmd ci
npm.cmd run dev
```

Open http://127.0.0.1:5173. With the backend and MySQL running and `.env`
configured, both connection cards should show `Connected`.
If a service is stopped, the page shows `Unavailable`; restart it and select
`Refresh status`. Stop the frontend with Ctrl+C.

Vite forwards `/api/*` requests to the local FastAPI backend. Database credentials
stay on the backend; they are never sent to the browser. This proxy is for local
development. A production deployment will need its own API routing configuration.

To type-check and build the frontend:

```powershell
npm.cmd run build
```

The build output is in `frontend/dist/` (ignored by Git).

## GitHub Pages

`.github/workflows/pages.yml` builds and publishes the frontend on pushes to
`master`. The Pages build uses `/AGRIS/` as its asset base path. Enable GitHub
Actions as the Pages source in the repository settings.

GitHub Pages hosts only the frontend. The Python API and MySQL database must be
hosted separately. Until then the published page explains that live services are
not configured and does not attempt to connect to a visitor's localhost.
To connect a hosted API, set the repository Actions variable `VITE_API_URL` to
its HTTPS base URL and allow the Pages origin in the backend's CORS configuration.
Never add database credentials to frontend environment variables or GitHub Pages.
