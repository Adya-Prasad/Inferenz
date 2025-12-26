FROM postgres:15

# Install build deps, try installing packaged pgvector if available, otherwise build from source.
RUN apt-get update \
    && apt-get install -y --no-install-recommends git build-essential postgresql-server-dev-15 postgresql-15-pgvector make gcc ca-certificates || true \
    && if dpkg -s postgresql-15-pgvector >/dev/null 2>&1; then \
         echo "pgvector package is available and installed via apt"; \
       else \
         echo "pgvector package not found; building from source" && \
         git clone https://github.com/pgvector/pgvector.git /tmp/pgvector && \
         cd /tmp/pgvector && make && make install && \
         rm -rf /tmp/pgvector; \
       fi \
    && echo "Listing installed extension files:" && ls -la /usr/share/postgresql/15/extension || true \
    && echo "pg_config location:" && which pg_config || true \
    && apt-get remove -y git build-essential make gcc \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

# Healthcheck: use pg_isready to verify Postgres is accepting connections
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=10 CMD pg_isready -U postgres -d inferenz || exit 1
