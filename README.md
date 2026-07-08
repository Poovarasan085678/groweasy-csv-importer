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
- Automatic skipping of invalid records (no email and no phone)
- Results table showing imported vs skipped counts

## Architecture

Frontend (Next.js, Vercel) -> Upload CSV -> Preview (no AI) -> Confirm ->
Backend (Express, Render) -> Parse CSV -> Batch rows -> Gemini AI -> Structured CRM JSON -> Results table

## Tech Stack

Frontend: Next.js, TypeScript, Tailwind CSS, PapaParse
Backend: Node.js, Express, TypeScript, Multer, csv-parse, Google Gemini API (gemini-2.5-flash)
Deployment: Frontend on Vercel, Backend on Render

## CRM Field Schema

created_at, name, email, country_code, mobile_without_country_code, company, city, state, country, lead_owner, crm_status, crm_note, data_source, possession_time, description

Records with no email and no phone number are automatically skipped.

## Running Locally

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

## Project Structure

groweasy-assignment/
  backend/src/app.ts - Express server and /upload endpoint
  backend/src/services/aiExtractor.service.ts - Gemini AI integration
  backend/src/services/batching.service.ts - Splits rows into batches
  backend/src/prompts/crmExtraction.prompt.ts - AI system prompt
  backend/src/types/crm.types.ts - CRM TypeScript types
  frontend/app/page.tsx - Main UI
  README.md

## Design Decisions

- Preview before AI call avoids wasting AI calls on wrong uploads
- Batching keeps AI requests reliable for large files
- Skip logic filters out leads with no way to contact them

## Position Applied For
