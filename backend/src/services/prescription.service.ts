import axios from 'axios';
import path from 'path';
import { distance } from 'fastest-levenshtein';
import { doubleMetaphone } from 'double-metaphone';
import pool from './db.service';

interface Drug {
    brand_name: string;
    salt: string;
    phonetic_primary: string;
    brand_name_normalized: string;
}

interface DrugBuckets {
    list: Drug[];
    byLength: Map<number, Drug[]>;
    namesByLength: Map<number, string[]>;
    byPhonetic: Map<string, Drug[]>;
}

let cachedDrugs: DrugBuckets | null = null;

// Helper to strip common dosage forms for highly accurate core-name matching
function normalizeDrugName(name: string) {
    return name.toLowerCase()
        .replace(/\b(tablet|capsule|injection|syrup|suspension|drops?|cream|gel|ointment|solution|infusion|dr|sr|er|pr|mr|soft|gelatin|oral|mg|ml|mcg|gm|patch|lotion|spray|respules|inhaler)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

export async function initPrescriptionService() {
    if (cachedDrugs) return cachedDrugs.list; // For backwards compatibility
    try {
        console.log('\n[Prescription Service] Initializing Database & Phonetics Cache from Postgres...');
        
        // Ensure phonetic codes exist (Optional self-healing)
        const missingRows = await pool.query('SELECT id, brand_name FROM drugs WHERE phonetic_code IS NULL');
        if (missingRows.rows.length > 0) {
            console.log(`[Prescription Service] Found ${missingRows.rows.length} drugs missing phonetic codes! Computing now...`);
            
            for (const row of missingRows.rows) {
                const [primary] = doubleMetaphone(row.brand_name.split(' ')[0] || row.brand_name);
                await pool.query('UPDATE drugs SET phonetic_code = $1 WHERE id = $2', [primary, row.id]);
            }
            console.log('[Prescription Service] Missing phonetic codes successfully generated and saved!');
        } else {
            console.log('[Prescription Service] All phonetic codes are up to date in the database.');
        }

        console.log('[Prescription Service] Loading all drugs into memory for Lightning Fast search...');
        
        const result = await pool.query("SELECT brand_name, salt, phonetic_code FROM drugs");
        const rows = result.rows;

        const list = rows.map(row => ({
            brand_name: row.brand_name,
            salt: row.salt === 'UNKNOWN_SALT' || !row.salt ? '' : row.salt,
            phonetic_primary: row.phonetic_code,
            brand_name_normalized: normalizeDrugName(row.brand_name)
        }));

        // OPTIMIZATION: Bucket by string length and phonetic code for extreme O(1) filtering
        const byLength = new Map<number, Drug[]>();
        const namesByLength = new Map<number, string[]>();
        const byPhonetic = new Map<string, Drug[]>();
        
        for (const drug of list) {
            // Length Bucketing
            const len = drug.brand_name_normalized.length;
            if (!byLength.has(len)) {
                byLength.set(len, []);
                namesByLength.set(len, []);
            }
            byLength.get(len)!.push(drug);
            namesByLength.get(len)!.push(drug.brand_name_normalized);

            // Phonetic Bucketing
            if (drug.phonetic_primary) {
                if (!byPhonetic.has(drug.phonetic_primary)) {
                    byPhonetic.set(drug.phonetic_primary, []);
                }
                byPhonetic.get(drug.phonetic_primary)!.push(drug);
            }
        }

        cachedDrugs = { list, byLength, namesByLength, byPhonetic };
        
        console.log(`[Prescription Service] 🚀 Ready! Successfully indexed ${list.length} drugs in RAM.\n`);
        return cachedDrugs.list;
    } catch (e: any) {
        console.warn('\n[Prescription Service] ❌ Could not load drugs database. Ensure the scraper has run. Error:', e.message);
        return [];
    }
}

// Helper to get the full cache
export function getDrugCache() {
    if (!cachedDrugs) initPrescriptionService();
    return cachedDrugs;
}

/**
 * STEP 1: Extract suspected medicine names from transcript using MedGemma
 */
export const extractDrugs = async (transcript: string): Promise<string[]> => {
    const apiKey = process.env.DR7_API_KEY;
    const model = process.env.DR7_LLM_MODEL || 'medgemma-4b-it';
    const apiUrl = process.env.DR7_API_URL || 'https://dr7.ai/api/v1/medical/chat/completions';
    
    if (!apiKey) {
        throw new Error('DR7_API_KEY is not set in environment variables');
    }

    const systemPrompt = `You are a Named Entity Recognition (NER) assistant. Extract all words or phrases that sound like medication names from the text. Ignore spelling mistakes. Include the numerical dosage if it is spoken next to the medication name (e.g., 'rebeca 20mg'). Do NOT include frequency instructions like 'twice a day'. Respond ONLY with a valid JSON array of strings. Example: ["rebeca 20mg", "calvon"]`;

    const response = await axios.post(apiUrl, {
        model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: transcript }
        ],
        max_tokens: 500,
        temperature: 0.1
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        }
    });

    try {
        const content = response.data.choices[0].message.content;
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const extracted = JSON.parse(jsonStr);
        if (Array.isArray(extracted)) return extracted;
        return [];
    } catch (e) {
        console.error('Failed to parse LLM output as JSON', response.data);
        return [];
    }
};

/**
 * STEP 2: Map extracted drug names using HYBRID Phonetic + Sørensen–Dice Search
 */
export const mapDrugsToDatabase = (extractedDrugs: string[]) => {
    const cache = getDrugCache();
    if (!cache || !cache.list || cache.list.length === 0) {
        throw new Error('Drug database is empty or not initialized.');
    }

    const allDrugs = cache.list;
    const mappedResults = [];

    for (const extractedWord of extractedDrugs) {
        const extLower = normalizeDrugName(extractedWord);
        const [extPrimary] = doubleMetaphone(extLower.split(' ')[0] || extLower);

        const extLen = extLower.length;
        const fuzzyResults: any[] = [];
        
        for (let l = Math.max(1, extLen - 6); l <= extLen + 6; l++) {
            if (cache.byLength.has(l)) {
                const arr = cache.byLength.get(l)!;
                const namesArr = cache.namesByLength.get(l)!;
                for (let i = 0; i < arr.length; i++) {
                    const target = namesArr[i];
                    const dist = distance(extLower, target);
                    
                    const maxLength = Math.max(extLen, target.length);
                    let score = Math.max(0, 100 - (dist / maxLength) * 100);
                    
                    // Tie breakers for exact prefixes and length penalties
                    if (target.startsWith(extLower)) score += 5;
                    score -= Math.abs(target.length - extLen) * 0.01;
                    
                    if (score > 40) {
                        fuzzyResults.push({ ...arr[i], score, match_type: 'Fuzzy' });
                    }
                }
            }
        }
        
        // Sort with a stable secondary sort alphabetically if scores match exactly
        fuzzyResults.sort((a, b) => b.score - a.score || a.brand_name.localeCompare(b.brand_name));
        const topFuzzy = fuzzyResults.slice(0, 5);

        let phoneticResults: any[] = [];
        if (extPrimary && cache.byPhonetic.has(extPrimary)) {
            const phoneticBucket = cache.byPhonetic.get(extPrimary)!;
            phoneticResults = phoneticBucket
                .map(d => {
                    const dist = distance(extLower, d.brand_name_normalized);
                    const maxLength = Math.max(extLen, d.brand_name_normalized.length);
                    let score = Math.max(0, 100 - (dist / maxLength) * 100);
                    
                    // Tie breakers
                    if (d.brand_name_normalized.startsWith(extLower)) score += 5;
                    score -= Math.abs(d.brand_name_normalized.length - extLen) * 0.01;
                    
                    return { ...d, score, match_type: 'Phonetic' };
                })
                .sort((a, b) => b.score - a.score || a.brand_name.localeCompare(b.brand_name))
                .slice(0, 5);
        }

        // Logic: Auto-pick if top fuzzy and top phonetic are identical
        let autoPicked = null;
        if (topFuzzy.length > 0 && phoneticResults.length > 0) {
            if (topFuzzy[0].brand_name === phoneticResults[0].brand_name) {
                autoPicked = topFuzzy[0];
            }
        }

        mappedResults.push({
            original_extracted_word: extractedWord,
            phonetic_code: extPrimary,
            auto_picked: autoPicked ? {
                brand_name: autoPicked.brand_name,
                salt: autoPicked.salt,
                score: autoPicked.score
            } : null,
            top_phonetic: phoneticResults.slice(0, 5).map(r => ({
                brand_name: r.brand_name,
                salt: r.salt,
                match_type: r.match_type,
                score: r.score
            })),
            top_fuzzy: topFuzzy.slice(0, 5).map(r => ({
                brand_name: r.brand_name,
                salt: r.salt,
                match_type: r.match_type,
                score: r.score
            }))
        });
    }

    return mappedResults;
};

import fs from 'fs';

export const generatePrescription = async (transcript: string, mappedDrugs: any[]) => {
    console.log('[Prescription Service] Generating final prescription via MedGemma...');
    
    // 1. Build prompt for MedGemma
    const prompt = `You are an expert Medical AI Prescription Writing Assistant.
Your task is to generate a highly professional and structured clinical prescription.

RAW TRANSCRIPT:
"""${transcript}"""

MAPPED MEDICATIONS (Candidates):
${JSON.stringify(mappedDrugs, null, 2)}

INSTRUCTIONS:
1. Extract all clinical details (chief complaint, vitals, history, etc.) from the transcript. Extract Patient Name, Age, and Gender if mentioned. If something is not mentioned, use "N/A" or leave empty.
2. Identify the medications prescribed in the transcript.
3. For each medication, select the **single BEST matching brand_name** from the provided "MAPPED MEDICATIONS" list. 
   - If an "auto_picked" field exists for a medication, YOU MUST strictly use the "auto_picked" brand name. Do NOT look at top_phonetic or top_fuzzy.
   - If "auto_picked" is null, evaluate the 5 top_phonetic and 5 top_fuzzy matches provided. Pick the best one.
   - If NONE of the matches are clinically appropriate for the transcript context, or you cannot decide, you MUST output "UNVERIFIED" for that medication's brand_name so the doctor can manually intervene.
4. Extract the following for each medication:
   - **dose**: The amount to take (e.g., "1 Tablet", "10 ml", "50 mg").
   - **route**: Infer this from the selected brand_name. If the name contains "Tablet", "Capsule", or "Suspension", set route to "Oral". If it contains "Injection", set to "Subcutaneous / IM / IV". If it contains "Cream" or "Ointment", set to "Topical".
   - **frequency**: Normalize medical abbreviations (e.g., "OD" -> "Once daily (OD)", "BD" -> "Twice daily (BD)", "TDS" -> "Three times a day (TDS)", "HS" -> "At bedtime (HS)", "QID" -> "Four times a day (QID)").
   - **duration**: How long to take the medication (e.g., "5 days", "1 month").
   - **instructions**: ONLY write specific situational instructions (e.g., "After meals", "Before meals", "Take with water", "In the morning"). Do NOT write dosage like "1 tablet" here.
5. Return the exact JSON structure below, and NOTHING else (do not include markdown ticks).

REQUIRED JSON FORMAT:
{
  "patient_name": "",
  "patient_age": "",
  "patient_gender": "",
  "chief_complaint": "",
  "hpi": "",
  "allergies": "",
  "past_history": "",
  "vital_bp": "",
  "vital_hr": "",
  "vital_rr": "",
  "vital_temp": "",
  "vital_spo2": "",
  "vital_height": "",
  "vital_weight": "",
  "vital_bmi": "",
  "physical_examination": "",
  "tests_ordered": "",
  "key_results": "",
  "differential_diagnosis": "",
  "diet_lifestyle": "",
  "activity": "",
  "follow_up": "",
  "emergency_precautions": "",
  "medications": [
    {
      "medicine": "Exact brand_name from mapped list or UNVERIFIED",
      "dose": "",
      "route": "",
      "frequency": "",
      "duration": "",
      "instructions": ""
    }
  ]
}`;

    // 2. Call MedGemma
    const apiKey = process.env.DR7_API_KEY;
    const model = process.env.DR7_LLM_MODEL || 'medgemma-4b-it';
    const apiUrl = process.env.DR7_API_URL || 'https://dr7.ai/api/v1/medical/chat/completions';
    
    if (!apiKey) {
        throw new Error('DR7_API_KEY is not set in environment variables');
    }

    let aiResponse;
    try {
        const res = await axios.post(apiUrl, {
            model: model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 2000,
            temperature: 0.0
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        aiResponse = res.data.choices[0].message.content;
    } catch (e: any) {
        throw new Error('Failed to generate prescription with LLM: ' + (e.response?.data?.error || e.message));
    }

    // 3. Parse JSON
    let prescriptionData;
    try {
        // clean markdown ticks if any
        let cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        prescriptionData = JSON.parse(cleanJson);
    } catch (e) {
        throw new Error('LLM returned invalid JSON for prescription.');
    }

    // 4. Load Template
    const templatePath = path.join(__dirname, '..', '..', 'assets', 'prescription_template.html');
    let html = fs.readFileSync(templatePath, 'utf-8');

    // 5. Replace simple tags
    const tags = [
        'patient_name', 'patient_age', 'patient_gender',
        'chief_complaint', 'hpi', 'allergies', 'past_history', 
        'vital_bp', 'vital_hr', 'vital_rr', 'vital_temp', 'vital_spo2', 
        'vital_height', 'vital_weight', 'vital_bmi', 'physical_examination',
        'tests_ordered', 'key_results', 'differential_diagnosis', 
        'diet_lifestyle', 'activity', 'follow_up', 'emergency_precautions'
    ];
    
    html = html.replace('{{visit_date}}', new Date().toLocaleDateString());

    for (const tag of tags) {
        const val = prescriptionData[tag] || '';
        html = html.replace(`{{${tag}}}`, val);
    }

    // 6. Generate Medication Rows HTML
    let medRowsHtml = '';
    const meds = prescriptionData.medications || [];
    for (const m of meds) {
        medRowsHtml += `
<tr>
    <td><b>${m.medicine || ''}</b></td>
    <td>${m.dose || ''}</td>
    <td>${m.route || ''}</td>
    <td>${m.frequency || ''}</td>
    <td>${m.duration || ''}</td>
    <td>${m.instructions || ''}</td>
</tr>`;
    }
    html = html.replace('{{medication_rows_html}}', medRowsHtml);

    return { 
        html, 
        patientName: prescriptionData.patient_name || 'Unknown', 
        diagnosis: prescriptionData.final_diagnosis || prescriptionData.differential_diagnosis || 'Unknown'
    };
};
