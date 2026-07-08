@'
# GrowEasy CRM CSV Importer

An AI-powered CSV importer that intelligently extracts CRM lead information from any CSV format and maps it into GrowEasy's standardized CRM schema.

## Live Links

- Live Application: https://groweasy-csv-importer-eta.vercel.app
- Backend API: https://groweasy-csv-importer-ukip.onrender.com
- GitHub Repository: https://github.com/Poovarasan085678/groweasy-csv-importer

## Features

- Drag & drop or click-to-upload CSV files
- Client-side preview before any AI processing (no API calls until user confirms)
- Responsive preview table with sticky headers and scrolling
- AI-powered field mapping for any column naming convention
- Batch processing (25 rows per AI request)
- Automatic retry with backoff for failed AI batches (up to 3 attempts)
- Automatic skipping of invalid records (no email and no phone)
- Results table showing imported vs skipped counts

## Architecture

Frontend (Next.js, Vercel) -> Upload CSV -> Preview (no AI) -> Confirm ->
Backend (Express, Render) -> Parse CSV -> Batch rows -> Gemini AI (with retry) -> Structured CRM JSON -> Results table

## Tech Stack

Frontend: Next.js, TypeScript, Tailwind CSS, PapaParse
Backend: Node.js, Express, TypeScript, Multer, csv-parse, Google Gemini API (gemini-2.5-flash)
Testing: Jest, ts-jest
Deployment: Frontend on Vercel, Backend on Render, Docker support included

## CRM Field Schema

created_at, name, email, country_code, mobile_without_country_code, company, city, state, country, lead_owner, crm_status, crm_note, data_source, possession_time, description

Records with no email and no phone number are automatically skipped.

Allowed crm_status values: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE
Allowed data_source values: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots

## Running Locally (without Docker)

### Prerequisites
- Node.js 18+
- A free Gemini API key from https://aistudio.google.com/app/apikey

### Backend setup
cd backend
npm install
Create a .env file with: GEMINI_API_KEY=your_key_here
npx ts-node-dev src/app.ts
Runs on http://localhost:4000

### Frontend setup
cd frontend
npm install
npm run dev
Runs on http://localhost:3000

Note: if running fully locally, update the fetch URL in frontend/app/page.tsx from the deployed Render URL back to http://localhost:4000/upload

## Running with Docker

This project includes Docker support for both frontend and backend.

### Prerequisites
- Docker Desktop installed and running

### Steps

1. Create a .env file in the backend/ folder with your Gemini API key:
GEMINI_API_KEY=your_gemini_api_key_here

2. From the project root, run:
docker-compose up --build

3. This will:
- Build and start the backend on http://localhost:4000
- Build and start the frontend on http://localhost:3000

4. To stop the containers:
docker-compose down

## Running Tests

Unit tests are included for the batching service.

cd backend
npm test

Expected output: 4 passing tests covering batch splitting logic, including edge cases (empty input, default batch size, single batch).

## Project Structure

groweasy-assignment/
  backend/
    src/app.ts - Express server and /upload endpoint
    src/services/aiExtractor.service.ts - Gemini AI integration with retry logic
    src/services/batching.service.ts - Splits rows into batches
    src/services/batching.service.test.ts - Unit tests
    src/prompts/crmExtraction.prompt.ts - AI system prompt
    src/types/crm.types.ts - CRM TypeScript types
    Dockerfile
    .dockerignore
    jest.config.js
  frontend/
    app/page.tsx - Main UI: upload, preview, confirm, results
    Dockerfile
    .dockerignore
  docker-compose.yml
  README.md

## Design Decisions

- Preview before AI call avoids wasting AI calls on wrong uploads and lets users verify their data first
- Batching keeps AI requests reliable and within reasonable prompt sizes for large files
- Retry with exponential backoff handles transient AI API failures gracefully
- Skip logic filters out leads with no way to contact them, since they are not actionable CRM leads
- Docker support ensures consistent environment setup across machines

## Bonus Features Implemented

- Drag & drop upload
- Retry mechanism for failed AI batches
- Docker setup for both frontend and backend
- Unit tests
- Deployment on Vercel and Render
- Well-written README with setup instructions

## Position Applied For

Software Developer - Intern 
'@ | Out-File -FilePath README.md -Encoding utf8