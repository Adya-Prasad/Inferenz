<h2 style="color:#e53935; font-weight:500; font-size: 1.2rem;">1. Startup Error</h3>

- Two issues caused the startup error:
1. Incorrect relative imports in the v1 endpoints that caused imports to resolve incorrectly.
2. A naming collision: an ORM attribute named `metadata` conflicted with **SQLAlchemy's** class-level `metadata`.

<h3 style="color:#43a047; font-weight:500;font-size: 1.1rem;">Solution:</h3>

- Fixed relative imports in:
    - `datasources.py` (used .... to reach top-level `app`)
    - `search.py` (used .... to reach top-level `app`)
- Resolved the metadata conflict:
    - Renamed the model attribute to `metadata_` in `models.py` and kept the DB column name `"metadata"`.
    - Removed the class-level synonym/property that shadowed Base.metadata.
    - Updated Pydantic schema `DataChunkRead` in `schemas.py` to expose `metadata` via an alias using `Field(..., alias="metadata")`.
- File Modified: `datasources.py`, `search.py`, `models.py`, `schemas.py`

---

<h2 style="color:#e53935; font-weight:500; font-size: 1.2rem;">2. Server startup failed due to a database authentication error</h3>

- Error: `asyncpg.exceptions.InvalidPasswordError: password authentication failed for user "postgres"`.
- Root cause: Docker maps Postgres to host port 5433 ("5433:5432" in docker-compose.yml), but the app was trying to connect to 5432 by default.

<h3 style="color:#43a047; font-weight:500;font-size: 1.1rem;">Solution:</h3>

- Updated the default DATABASE_URL in database.py to use port 5433 (to match docker-compose).
- Updated database.py default: `from postgresql+asyncpg://postgres:postgres@localhost:5432/inferenz` to `postgresql+asyncpg://postgres:postgres@localhost:5433/inferenz`