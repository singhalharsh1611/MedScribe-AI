# Medical Voice Translator & Prescription Pipeline

This document explains how to set up, run, and test the backend services, including the STT (Speech-to-Text) server, and the AI Prescription Pipeline.

## 1. Environment Setup

Before running anything, ensure your `backend/.env` file is fully configured. It should look like this:

```env
PORT=3001
FRONTEND_URL=http://localhost:3000

# Sarvam STT WebSocket Credentials
SARVAM_API_KEY=your_sarvam_api_key

# Dr7 MedGemma Credentials (For Drug Extraction)
DR7_LLM_MODEL=medgemma-4b-it
DR7_API_KEY=api_key_dr7.ai
DR7_API_URL=https://dr7.ai/api/v1/medical/chat/completions

# Managed Neon PostgreSQL Database
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
```

Make sure to install all dependencies if you haven't already:
```bash
cd backend
npm install
```

---

## 2. The Cloud Database (Neon PostgreSQL)

We migrated the massive 135MB SQLite database of 386,000+ Indian drugs into a fully managed **Neon PostgreSQL** cluster. 
This means you no longer need to scrape 1mg yourself or store massive `.sqlite` files in the repository. 
The backend connects directly to Neon.

Build the additive medication search index after importing or changing drug names:

```bash
cd backend
npm run migrate:drug-search
```

This creates and refreshes `drug_search_index` and `drug_aliases`. It does not rewrite the source `drugs` rows.

### The 1mg Scraper
If you ever need to update the database, the scraper is located in `backend/1mgDrugsScraper/scrape.ts`.
It connects directly to the Neon PostgreSQL `DATABASE_URL` and runs highly concurrent (50 parallel workers) requests to fetch the master sitemap and scrape the salt compositions from SEO meta tags.

---

## 3. Running the Backend Server

```bash
cd backend
npm run dev
```

This server hosts both the standard REST API and the WebSocket server required for live audio streaming to Sarvam.
On boot, you should see a console log saying:
`Connected to Neon Postgres`

---

## 4. The Prescription Service (Step-by-Step)

The Prescription pipeline bridges the gap between messy audio transcriptions and medical accuracy. It happens in three distinct steps. 

### Step 1: LLM Extraction
Because voice transcripts are messy (e.g., *"take rebeca twenty milligram twice a day"*), we cannot fuzzy search the whole sentence.
* **Endpoint:** `POST /api/prescription/extract`
* **Input:** `{ "transcript": "take rebeca twenty milligram twice a day" }`
* **What happens:** We send the transcript to **MedGemma** via the Dr7 API. MedGemma is prompted strictly for Named Entity Recognition (NER).
* **Output:** It returns a clean JSON array of suspected names exactly as they were misspelled.

### Step 2: Constrained Database Mapping
Now we must map those misspelled words to real Indian drugs using our cloud database.
* **Endpoint:** `POST /api/prescription/map`
* **Input:** `{ "extractedDrugs": ["rebeca"] }`
* **What happens:** Exact, compact, token-phonetic, and fuzzy retrieval build a broad candidate pool. Dosage form, qualifiers, release type, and ordered visible strengths then reject incompatible products and rank the remaining candidates.
* **Output:** It returns structured candidates with evidence, conflicts, confidence, and one of `matched`, `needs_review`, or `no_match`.

### Step 3: Final Prescription Generation
* **Endpoint:** `POST /api/prescription/generate`
* **What happens:** MedGemma receives only the constrained database candidates and returns a candidate ID. Backend validation rejects IDs outside the candidate list and leaves ambiguous medicines unresolved for clinician review.

### Step 4: Saving to History
* **Endpoint:** `POST /api/prescription/save`
* **What happens:** The doctor can edit the HTML manually in the frontend iframe. Once finalized, clicking "Save" stores the HTML permanently in the Neon Postgres `prescriptions` table.
