# SleekCare AI Voice Prescription Generator

A complete enterprise-grade web application for speech-to-text transcription, medical mapping, and digital prescription generation across Indian languages.

## Project Overview
This application allows a doctor to:
1. Speak naturally into their microphone in English, Hindi, or Auto-detected languages.
2. Transcribe the audio instantly into text.
3. Use MedGemma AI to automatically extract suspected drug names, patient names, and diagnosis from the unstructured text.
4. Perform extreme high-speed phonetic + fuzzy matching (O(1) bucketing) against a heavily optimized database of 386,000+ Indian medicines (scraped from 1mg) to map spoken words directly to exact brand names and generic salts.
5. Generate a beautiful, printable HTML digital prescription that is fully editable.
6. Automatically save the exact prescription, pipeline latency metrics, and API costs to a PostgreSQL database.

## Architecture
- **Frontend**: Next.js 15, React 19, Tailwind CSS v4.
- **Backend**: Express + Node.js, WebSocket (for live STT), `pg` (PostgreSQL client).
- **Databases**: Neon PostgreSQL (fully managed cloud SQL).
  - Contains 386,000+ drugs with Trigram indexing (`pg_trgm`) and Double Metaphone phonetic codes.
  - Usage tracking and prescription history.
- **AI Providers**: 
  - **Sarvam AI**: For native streaming STT (Speech to Text) customized for Indian accents.
  - **MedGemma 4B**: Specialized medical LLM (hosted on DR7 API) for zero-shot clinical entity extraction and HTML prescription generation.

## Setup

1. **Clone the repository** and navigate to the project root.
2. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```
3. **Install Backend Dependencies:**
   ```bash
   cd ../backend
   npm install
   ```

## Environment Variables

### Backend
In `backend/`, copy `.env.example` to `.env` (or create `.env`):
```bash
PORT=3001
FRONTEND_URL=http://localhost:3000
SARVAM_API_KEY=your_sarvam_api_key_here
DR7_API_KEY=your_dr7_api_key_here
DR7_LLM_MODEL=medgemma-4b-it
DR7_API_URL=https://dr7.ai/api/v1/medical/chat/completions
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
```

### Frontend
In `frontend/`, create a `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Running Locally

1. **Start the Backend (Express):**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend (Next.js):**
   ```bash
   cd frontend
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser.

## Cloud Deployment (Render.com)

The application is completely stateless and ready for deployment on Render.com or Vercel.
- **No Local Files**: Because all databases (including the massive 135MB drug dataset) were successfully migrated to **Neon PostgreSQL**, you can deploy this on Render's Free Web Services without data loss.
- Ensure you set all the Environment Variables above in the Render Dashboard.
