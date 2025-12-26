You are an expert full-stack MLOps engineer building production AI systems. The goal is create a multiple agent data insights platform which as ai agents tool where users like shopkeeper, academics, analysts can upload unstructured or semi-structured data (PDFs, images of notes, text files, csv, excel) and use AI to automatically structure, analyze, visualize, storytell and show prediction on it.

Platform: We are building this platform to let busy shopkeeper, students and people to extract insights from their simple data they they write in unstructured way or something in ledger or Excel sheets. Platform ui should be resposive and professional

Web Application UI: Main page should be a header then below it a heading with short paragraph that below is comes that main component. Input wraper, A completely center aligned with border radious input wrapper with text input placeholder for prompt (optional, because our agent will handle it), drop down list of different data format like pdf, txt, json, csv or image, data upload icon, and send button icon. As user click send, agents start working in order, first verify and validate the data format, then all other agent for data pipeline like data formating correctly and then data analysis. Use Beautiful and professional two Pastel color theme

## Core Tech Stack:
Frontend: React with Next.js (using TypeScript).
Backend: Python with FastAPI (fully asynchronous).
Database: PostgreSQL with the pgvector extension.
AI: LangChain + CrewAI agents + HuggingFace Model OCR Models

## Core Database Schema & Data Models:
1. Datasource Model (replaces Document):

- id: UUID, Primary Key.
- user_id: Foreign Key to users.id.
- file_name: String (e.g., "q4_financials.pdf").
- storage_key: String (the key in our S3 bucket, e.g., "user_uuid/datasource_uuid.pdf").
- file_type: String (e.g., "application/pdf").
- status: Enum/String ("uploaded", "processing", "failed", "completed"), default "uploaded".
- created_at: DateTime, with server default.


2. DataChunk Model (replaces LedgerEntry): This is a generic table for any piece of extracted text.

- id: UUID, Primary Key.
- datasource_id: Foreign Key to datasources.id.
- user_id: Foreign Key to users.id.
- chunk_text: Text (the text extracted from a part of the document).
- metadata: JSONB (to store contextual info, like page number, bounding box, etc.).
- embedding: vector(384) from pgvector.sqlalchemy. This will store the embedding of the chunk_text.

## Project Structure and the Datasource Upload Endpoint

1. Project Directory Structure: Lay out a professional FastAPI project structure (/app, /app/main.py, /app/models.py, /app/schemas.py, /app/api/v1/endpoints/datasources.py, etc.). Use API versioning from the start.
2. Database Setup (app/database.py): Configure the SQLAlchemy async engine and session management for PostgreSQL.

3. ORM Models (app/models.py): Write the SQLAlchemy classes for User, Datasource, and DataChunk as defined above, using UUID as primary keys and importing Vector from pgvector.sqlalchemy.

4. Pydantic Schemas (app/schemas.py): Create Pydantic schemas for API interaction (e.g., DatasourceCreate, DatasourceRead).

5. API Endpoint (app/api/v1/endpoints/datasources.py): - Create a new FastAPI APIRouter.
- Implement the endpoint: POST /.
- This endpoint should accept a file upload (UploadFile). For now, we can assume a hardcoded user ID.
- The endpoint's function should be async and perform these steps: a. Generate a unique storage_key for the file. b. Simulate the file upload to object storage (e.g., print a log message). c. Create a new Datasource record in the PostgreSQL database using an async session. d. Return the created Datasource object using the DatasourceRead schema.

- Main Application (app/main.py):
Initialize the FastAPI app.
Include the new router from datasources.py with a prefix like /api/v1/datasources.
Implement a startup event to create the database tables.

# SUCCESS CRITERIA
1. Effectively recognize which format of data is given.
2. Semantic search "दूध" returns milk transactions
3. Scales to 100 concurrent uploads
4. 90%+ extraction accuracy on messy handwriting

Ensuring it's quality and concise codes, add proper comments and docs string and idiomatic, asynchronous, and production-ready.