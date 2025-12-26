Docker builds images for each service (if needed), creates and starts containers, wires them together (network, env vars, volumes), and runs them in the foreground. For our repo that means you get a Postgres DB (with pgvector), the FastAPI backend, and the Next.js frontend running together so you can test end-to-end.

### What each service in the compose file does 
1. **Postgres:**
- Custom image built from `Dockerfile`.
- That Dockerfile installs/compiles the `pgvector` extension so `CREATE EXTENSION vector;` will work.
- Exposes port 5432 and mounts persistent volume `pgdata` so DB files persist across restarts.
- Runs init SQL from `init.sql` to create the vector extension on first startup.

2. **Backend:**
- Built from `Dockerfile` (installs Python deps from requirements.txt).
- Uses env var `DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/inferenz` so inside the compose network the hostname postgres resolves to the Postgres container.
- Exposes port 8000 to the host.

3. **Frontend:**
- Built from `Dockerfile` (installs npm deps and runs dev server).
- Uses `NEXT_PUBLIC_API_URL=http://backend:8000` to call the backend container.
- Exposes port 3000 to the host.

### What happens step-by-step when you run `docker compose up --build`
1. Compose reads `docker-compose.yml`.
2. For each service with a build: section, Docker builds an image:
    - `postgre`s image compiles and installs. `pgvector` (this step can take a few minutes).
    - backend image installs Python packages.
    - frontend image runs npm ci.
3. Compose creates a default network for the services and mounts any declared volumes (e.g., `pgdata`).
4. Compose starts containers. depends_on ensures containers start in the declared order but does not wait for readiness.
5. Postgres runs init scripts in /docker-entrypoint-initdb.d on first startup — our init.sql runs CREATE EXTENSION IF NOT EXISTS vector;.
6. Backend starts and connects to Postgres using the DATABASE_URL host postgres.
7. Frontend starts and can make browser requests to http://localhost:3000 which call the backend at http://localhost:8000 (mapped by compose).


### Quick verification steps ✅
1. Run:
```bash
docker compose up --build
```
2. Open: [http://localhost:3000](http://localhost:3000) (frontend UI)
3. Check backend health: curl [http://localhost:8000/health](http://localhost:8000/health) → should return `{"status":"ok"}`
4. **Check DB extension:** docker compose exec postgres psql -U postgres -d inferenz -c "SELECT * FROM pg_extension;"

### Useful Commands
1. Start (build if needed) in foreground:
```bash
docker compose up --build
```
2. Start in background (detached):
```bash
docker compose up -d --build
```
3. View logs (live):
```bash
docker compose logs -f backend
```
```bash
docker compose logs -f postgres
```
4. List running containers:
``` bash
docker compose ps
```
5. Stop and remove containers (keep volume data):
```bash
docker compose down
```
6. Stop and remove containers + volumes (removes DB data):
```bash
docker compose down -v
```
7. Rebuild only:
```bash
docker compose build backend
```