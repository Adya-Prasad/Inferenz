
## How to Setup and Run Locally
#### 1. Clone the repository
```bash
git clone
```
#### 2. Start Docker
1. Open your CLI, cd to project root where `docker-compose.yml` is
2. Run
```bash
docker compose up --build
OR
docker compose up --build postgres
OR (without attached)
docker compose up -d postgres
```
> Notes: The first run needs to build the custom Postgres image (it runs apt and compiles pgvector). Postgres init script (postgres-init/init.sql) runs at first db startup to create the vector extension.

3. Confirm services (Expected ports):
- Postgres: 5433 (host)
- Backend: 8000
- Frontend: 3000
4. Health checks:
- curl http://localhost:8000/health → {"status":"ok"}
- visit http://localhost:3000 to use the UI.

#### Backend:
1. Create & activate a virtual env (ex: .venv)
2. Install Dependencies
```
pip install -r backend/requirements.txt
```
3. Copy `backend/.env.sample` to `.env` or set `DATABASE_URL` (update backend DATABASE_URL)
```bash
set DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5433/inferenz
```
4. Run the uvicorn server:
```bash
uvicorn app.main:app --reload --port 8000
```

#### Frontend:
1. Move the frontend directory
```
cd frontend/inferenz
```
2. Install packages
```
npm install
```
3. Copy `.env.local.sample` to `.env.local` and update `NEXT_PUBLIC_API_URL` if needed
```bash
set NEXT_PUBLIC_API_URL=http://localhost:8000
```
4. Now start the local devlopment server
```
npm run dev
```
opens at: [http://localhost:3000](http://localhost:3000)

### Some Debug Steps to Verify Locally

##### 1. Check the all api points and imports
> Make sure you are in backend directory and activated venv
```
python -c "import app; import app.api.v1.endpoints.datasources; import app.api.v1.endpoints.search; print('IMPORT_OK')"
```

#### 2. Any Docker and Database Issue? Check Postgres logs until it reports "database system is ready to accept connections"
```
docker compose logs -f postgres
```

#### 3. Error: `pgvector` not found or installed! 
Rebuild image to ensure pgvector server files exist
```
docker compose up --build -d postgres
```