
import axios from "axios";
import * as fs from "fs";
import FormData from "form-data";

export const transcribeAudioModal = async (
  audioPath: string,
  onProgress?: (text: string) => void
) => {
  const apiKey = process.env.MODAL_API_KEY;
  
  if (onProgress) {
    onProgress("Starting Modal API transcription...");
  }

  const formData = new FormData();
  formData.append("file", fs.createReadStream(audioPath));

  try {
    const modalTranscribeUrl = process.env.MODAL_TRANSCRIBE_URL || "https://sleekcare0109--parrotlet-web.modal.run/transcribe";
    const response = await axios.post(modalTranscribeUrl, formData, {
      headers: {
        ...formData.getHeaders(),
        "Authorization": `Bearer ${apiKey}`
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
      detectedLanguage: "en", // Assuming English for now
    };
  } catch (error: any) {
    console.error("Modal Transcription Error:", error.response?.data || error.message);
    throw new Error(`Modal STT Error: ${error.message}`);
  }
};

