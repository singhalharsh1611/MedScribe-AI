# Indian Language Voice Translator

A complete MVP web application for speech-to-text transcription and text translation across 28 Indian languages.

## Project Overview
This application allows a user to:
1. Select the language being spoken.
2. Record audio directly from their microphone OR upload an existing audio file.
3. Transcribe the audio into text in the *original spoken language and native script*.
4. Allow the user to edit the transcription.
5. Select a target language.
6. Translate the transcription into the selected target language.
7. Copy or edit the translated text.

The application conceptually separates Transcription from Translation as requested. It uses the Sarvam AI API as the backend provider, which specializes in Indian languages.

## Architecture
- **Frontend**: Next.js 15, React 19, Tailwind CSS v4, Lucide Icons, Axios.
- **Backend**: Express + Node.js, Multer (for audio uploads), Axios, `google-translate-api-x`.
- **AI Providers**: Abstracted cleanly in backend services. Currently implemented with Sarvam AI for STT and Google Translate (Free API) for Translation.

## Supported Languages
The application contains a registry of 28 Indian languages. The 28th distinct language implemented is **Tulu**.

**Important note about AI provider limitations:**
Sarvam AI natively targets the 22 scheduled Indian languages for transcription. For the remaining 6 languages in the 28-language requirement (such as Tulu, Bhojpuri, Rajasthani, Chhattisgarhi, Magahi, Awadhi), transcription is marked as unsupported, and the application gracefully displays an error.
However, because translation is powered by the Google Translate API (via `google-translate-api-x`), all 28 languages support translation (either explicitly or via close dialect fallback in Google's engine).

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
In `backend/`, copy `.env.example` to `.env`:
```bash
PORT=3001
FRONTEND_URL=http://localhost:3000
SARVAM_API_KEY=your_sarvam_api_key_here
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
   npm run start:dev
   ```

2. **Start the Frontend (Next.js):**
   ```bash
   cd frontend
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser.

## API Documentation

- `GET /api/languages`: Returns an array of supported languages along with boolean flags `sttSupported` and `translationSupported`.
- `POST /api/transcription`: Accepts `multipart/form-data` with `audio` (file) and `language` (code). Returns `{ text, language, detectedLanguage }`.
- `POST /api/translation`: Accepts JSON `{ text, sourceLanguage, targetLanguage }`. Returns `{ translatedText }`.
