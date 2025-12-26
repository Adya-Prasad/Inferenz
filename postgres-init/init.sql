-- Initialize pgvector extension for embedding storage
DO $$
BEGIN
    -- If the extension is available on the server, create it. Otherwise emit notice and continue.
    IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'vector') THEN
        CREATE EXTENSION IF NOT EXISTS vector;
    ELSE
        RAISE NOTICE 'pgvector extension not available on this server; skipping CREATE EXTENSION.';
    END IF;
END$$;

