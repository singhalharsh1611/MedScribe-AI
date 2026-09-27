import axios from "axios";
import * as fs from "fs";
import FormData from "form-data";

export const transcribeAudio = async (
  audioPath: string,
  onProgress?: (text: string) => void
) => {
  if (onProgress) {
    onProgress("Starting ASR transcription...");
  }

  const formData = new FormData();
  formData.append("file", fs.createReadStream(audioPath));

  try {
    const transcribeUrl = process.env.TRANSCRIBE_URL || "https://medai.eka.care/api/asr/transcribe";
    const response = await axios.post(transcribeUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      }
    });

    let transcript = "";
    const data = response.data;
    
    if (typeof data === "string") {
      transcript = data;
    } else if (data?.output?.transcript) {
      transcript = data.output.transcript;
    } else if (data?.output && typeof data.output === "string") {
      transcript = data.output;
    } else if (data?.text) {
      transcript = data.text;
    } else if (data?.transcript) {
      transcript = data.transcript;
    } else if (Array.isArray(data) && data.length > 0 && (data[0].text || data[0].transcript)) {
      transcript = data.map((item: any) => item.text || item.transcript || "").join(" ");
    } else if (data?.segments && Array.isArray(data.segments)) {
      transcript = data.segments.map((s: any) => s.text || "").join(" ");
    } else {
      const findText = (obj: any): string => {
        if (!obj || typeof obj !== "object") return "";
        if (obj.text && typeof obj.text === "string") return obj.text;
        if (obj.transcript && typeof obj.transcript === "string") return obj.transcript;
        for (const key of Object.keys(obj)) {
          const res = findText(obj[key]);
          if (res) return res;
        }
        return "";
      };
      const found = findText(data);
      transcript = found ? found : JSON.stringify(data);
    }
    
    if (onProgress) {
      onProgress(transcript);
    }
    
    return {
      text: transcript,
      detectedLanguage: "en",
    };
  } catch (error: any) {
    console.error("ASR Transcription Error:", error.response?.data || error.message);
    throw new Error(`ASR STT Error: `);
  }
};
