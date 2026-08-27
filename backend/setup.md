# Medical Voice Translator & Prescription Pipeline

This document explains how to set up, run, and test the backend services, including the 1mg web scraper, the STT (Speech-to-Text) server, and the AI Prescription Pipeline.

## 1. Environment Setup

Before running anything, ensure your `backend/.env` file is fully configured. It should look like this:

```env
PORT=3001
FRONTEND_URL=http://localhost:7000

# Sarvam STT WebSocket Credentials
SARVAM_API_KEY=your_sarvam_api_key

# Dr7 MedGemma Credentials (For Drug Extraction)
DR7_LLM_MODEL=medgemma-4b-it
DR7_API_KEY=api_key_dr7.ai
```

Make sure to install all dependencies if you haven't already:
```bash
cd backend
npm install
```

---

## 2. Building the Indian Drugs Database (The 1mg Scraper)

To do phonetic fuzzy matching, we need a local database of Indian brand names and their salt compositions. We built a high-speed, parallel scraper to fetch this from 1mg.

**How to run it:**
```bash
cd backend/1mgDrugsScraper
npx ts-node scrape.ts
```

**How it works:**
1. **Master Fetch:** If your database (`backend/assets/drugs.sqlite`) is empty, it first downloads the master `sitemap.xml` and discovers all 78 sub-sitemaps.
2. **Ingestion:** It extracts roughly ~780,000 URLs and inserts them into SQLite as `PENDING`. *(Note: The brand name is instantly extracted from the URL itself!).*
3. **Scraping:** It then launches 50 concurrent headless HTTP requests (with a 100ms delay) to visit each drug page, extract the exact Salt Composition from the SEO `<meta>` tags, and updates the row to `DONE`.

If the script crashes or gets rate-limited, simply run it again. It is designed to instantly pick up exactly where it left off!

---

## 3. Running the Backend Server

Once the `drugs.sqlite` database has some data, you can start the main backend API.

```bash
cd backend
npm run build
npm start
```
*(Or use `npm run dev` for hot-reloading during development).*

This server hosts both the standard REST API and the WebSocket server required for live audio streaming to Sarvam.

---

## 4. The Prescription Service (Step-by-Step)

The Prescription pipeline bridges the gap between messy audio transcriptions and medical accuracy. It happens in three distinct steps. 

### Step 1: LLM Extraction
Because voice transcripts are messy (e.g., *"take rebeca twenty milligram twice a day"*), we cannot fuzzy search the whole sentence.
* **Endpoint:** `POST /api/prescription/extract`
* **Input:** `{ "transcript": "take rebeca twenty milligram twice a day" }`
* **What happens:** We send the transcript to **MedGemma** via the Dr7 API. MedGemma is prompted strictly for Named Entity Recognition (NER).
* **Output:** It returns a clean JSON array of suspected names exactly as they were misspelled: `["rebeca"]`

### Step 2: Phonetic & Fuzzy Mapping
Now we must map those misspelled words to real Indian drugs using our scraped database.
* **Endpoint:** `POST /api/prescription/map`
* **Input:** `{ "extractedDrugs": ["rebeca"] }`
* **What happens:** The server loads the `drugs.sqlite` DB into RAM. Using the high-speed `fuzzysort` algorithm, it compares the misspelled word against all 780,000 brand names.
* **Output:** It returns the Top 5 most likely candidates along with their exact Salt composition and a fuzzy match score.
  ```json
  [
    {
      "original_extracted_word": "rebeca",
      "top_matches": [
        { "brand_name": "Rabemac 20", "salt": "Rabeprazole", "score": -14 },
        { "brand_name": "Rebagen", "salt": "Rebamipide", "score": -22 }
      ]
    }
  ]
  ```

### Step 3: Final Prescription Generation (Coming Next)
Once the UI has the mapped candidates, the final step is to pass the *original transcript* AND the *mapped candidate list* back to MedGemma. MedGemma will use the context list to fix the spelling errors and generate a perfectly formatted standard medical prescription!

*(You can test Step 1 and 2 directly from the Frontend UI right now by transcribing an audio file and clicking the **"Extract Drugs & Map to DB"** button!)*
