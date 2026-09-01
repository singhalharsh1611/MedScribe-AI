import axios from 'axios';
import path from 'path';
import { distance } from 'fastest-levenshtein';
import { doubleMetaphone } from 'double-metaphone';
import pool, { logMedGemmaUsage } from './db.service';

interface Drug {
    brand_name: string;
    salt: string;
    phonetic_primary: string;
    brand_name_normalized: string;
    brand_name_normalized_first: string;
    brand_name_normalized_alpha: string;
}

interface DrugBuckets {
    list: Drug[];
    byLength: Map<number, Drug[]>;
    namesByLength: Map<number, string[]>;
    firstNamesByLength: Map<number, string[]>;
    alphaNamesByLength: Map<number, string[]>;
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

        const list = rows.map(row => {
            const normalized = normalizeDrugName(row.brand_name);
            return {
                brand_name: row.brand_name,
                salt: row.salt === 'UNKNOWN_SALT' || !row.salt ? '' : row.salt,
                phonetic_primary: row.phonetic_code,
                brand_name_normalized: normalized,
                brand_name_normalized_first: normalized.split(' ')[0] || normalized,
                brand_name_normalized_alpha: normalized.replace(/[^a-z]+/gi, ' ').trim()
            };
        });

        // OPTIMIZATION: Bucket by string length and phonetic code for extreme O(1) filtering
        const byLength = new Map<number, Drug[]>();
        const namesByLength = new Map<number, string[]>();
        const firstNamesByLength = new Map<number, string[]>();
        const alphaNamesByLength = new Map<number, string[]>();
        const byPhonetic = new Map<string, Drug[]>();
        
        for (const drug of list) {
            // Length Bucketing
            const len = drug.brand_name_normalized.length;
            if (!byLength.has(len)) {
                byLength.set(len, []);
                namesByLength.set(len, []);
                firstNamesByLength.set(len, []);
                alphaNamesByLength.set(len, []);
            }
            byLength.get(len)!.push(drug);
            namesByLength.get(len)!.push(drug.brand_name_normalized);
            firstNamesByLength.get(len)!.push(drug.brand_name_normalized_first);
            alphaNamesByLength.get(len)!.push(drug.brand_name_normalized_alpha);

            // Phonetic Bucketing
            if (drug.phonetic_primary) {
                if (!byPhonetic.has(drug.phonetic_primary)) {
                    byPhonetic.set(drug.phonetic_primary, []);
                }
                byPhonetic.get(drug.phonetic_primary)!.push(drug);
            }
        }

        cachedDrugs = { list, byLength, namesByLength, firstNamesByLength, alphaNamesByLength, byPhonetic };
        
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

export function searchDrugs(query: string) {
    const cache = getDrugCache();
    if (!cache || !cache.list) return [];
    
    const q = query.toLowerCase().trim();
    if (!q) return [];
    
    const results = [];
    for (const drug of cache.list) {
        if (drug.brand_name_normalized.includes(q) || drug.brand_name.toLowerCase().includes(q)) {
            results.push(drug.brand_name);
            if (results.length >= 50) break;
        }
    }
    return results;
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

    const systemPrompt = `You are a strict Named Entity Recognition (NER) assistant for medical transcripts.
Extract ONLY the medication names (including their strength if spoken as part of the name, e.g., 'Calpol 500', 'Rebeca 20mg').
CRITICAL RULES:
1. You MUST extract the exact substring as it appears in the text. Do NOT correct spelling or invent characters.
2. STRIP AWAY all quantities, tablet counts, and dosing instructions (e.g., ignore '1', 'One', '1 tablet', '2 drops').
3. STRIP AWAY all frequency instructions (e.g., ignore 'OD', 'twice a day', 'HS', 'BD').
4. Respond ONLY with a valid JSON array of strings. Example: ["Rebeca 20mg", "Calvon", "Nexito Fort"]`;

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
        if (response.data.usage) {
            const inTokens = response.data.usage.prompt_tokens || 0;
            const outTokens = response.data.usage.completion_tokens || 0;
            const cost = (inTokens / 1000 * 0.001) + (outTokens / 1000 * 0.002);
            console.log(`[MedGemma] NER Cost: $${cost.toFixed(6)} (In: ${inTokens}, Out: ${outTokens})`);
            await logMedGemmaUsage('NER Extraction', inTokens, outTokens, cost).catch(e => console.error('Failed to log MedGemma usage:', e));
        }

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
        const extFirst = extLower.split(' ')[0] || extLower;
        const extAlpha = extLower.replace(/[^a-z]+/gi, ' ').trim();
        const fuzzyResults: any[] = [];
        
        for (let l = Math.max(1, extLen - 6); l <= extLen + 6; l++) {
            if (cache.byLength.has(l)) {
                const arr = cache.byLength.get(l)!;
                const namesArr = cache.namesByLength.get(l)!;
                const firstNamesArr = cache.firstNamesByLength.get(l)!;
                const alphaNamesArr = cache.alphaNamesByLength.get(l)!;
                for (let i = 0; i < arr.length; i++) {
                    const target = namesArr[i];
                    
                    // 1. Full string distance (Number-Blind)
                    const tarAlpha = alphaNamesArr[i];
                    const dist = distance(extAlpha, tarAlpha);
                    const maxLength = Math.max(extAlpha.length, tarAlpha.length);
                    const fullScore = maxLength === 0 ? 100 : Math.max(0, 100 - (dist / maxLength) * 100);
                    
                    // 2. First word distance (Heavy Weighting)
                    const tarFirst = firstNamesArr[i];
                    const firstDist = distance(extFirst, tarFirst);
                    const firstMax = Math.max(extFirst.length, tarFirst.length);
                    const firstScore = Math.max(0, 100 - (firstDist / firstMax) * 100);
                    
                    // Blend: 60% first word, 40% full string
                    let score = (firstScore * 0.6) + (fullScore * 0.4);
                    
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
        const uniqueFuzzy = Array.from(new Map(fuzzyResults.map(item => [item.brand_name, item])).values());
        uniqueFuzzy.sort((a, b) => b.score - a.score || a.brand_name.localeCompare(b.brand_name));
        const topFuzzy = uniqueFuzzy.slice(0, 6);

        let phoneticResults: any[] = [];
        if (extPrimary) {
            for (const [phoneCode, drugs] of cache.byPhonetic.entries()) {
                // Fuzzy Phonetic: distance <= 1
                if (phoneCode === extPrimary || distance(extPrimary, phoneCode) <= 1) {
                    const isExactPhonetic = phoneCode === extPrimary;
                    for (const d of drugs) {
                        // Same blending logic for ranking within phonetic bucket
                        const tarFirst = d.brand_name_normalized_first;
                        const firstDist = distance(extFirst, tarFirst);
                        const firstMax = Math.max(extFirst.length, tarFirst.length);
                        const firstScore = Math.max(0, 100 - (firstDist / firstMax) * 100);
                        
                        const tarAlpha = d.brand_name_normalized_alpha;
                        const dist = distance(extAlpha, tarAlpha);
                        const maxLength = Math.max(extAlpha.length, tarAlpha.length);
                        const fullScore = maxLength === 0 ? 100 : Math.max(0, 100 - (dist / maxLength) * 100);
                        
                        let score = (firstScore * 0.6) + (fullScore * 0.4);
                        
                        // Tie breakers
                        if (d.brand_name_normalized.startsWith(extLower)) score += 5;
                        score -= Math.abs(d.brand_name_normalized.length - extLen) * 0.01;
                        
                        // HUGE boost for exact phonetic match so they always rank above near-phonetic matches
                        if (isExactPhonetic) score += 50;
                        
                        phoneticResults.push({ ...d, score, match_type: isExactPhonetic ? 'Phonetic' : 'Near-Phonetic' });
                    }
                }
            }
            
            const uniquePhonetic = Array.from(new Map(phoneticResults.map(item => [item.brand_name, item])).values());
            phoneticResults = uniquePhonetic
                .sort((a, b) => b.score - a.score || a.brand_name.localeCompare(b.brand_name))
                .slice(0, 6);
        }

        mappedResults.push({
            original_extracted_word: extractedWord,
            phonetic_code: extPrimary,
            top_phonetic: phoneticResults.slice(0, 6).map(r => ({
                brand_name: r.brand_name,
                salt: r.salt,
                match_type: r.match_type,
                score: r.score,
                phonetic_code: r.phonetic_primary
            })),
            top_fuzzy: topFuzzy.slice(0, 6).map(r => ({
                brand_name: r.brand_name,
                salt: r.salt,
                match_type: r.match_type,
                score: r.score,
                phonetic_code: r.phonetic_primary
            }))
        });
    }

    return mappedResults;
};

import fs from 'fs';

export const generatePrescription = async (transcript: string, mappedDrugs: any[]) => {
    console.log('[Prescription Service] Generating final prescription via MedGemma...');
    
    // 1. Build prompt for MedGemma
    const prompt = `You are an elite Clinical Pharmacist and Medical AI Prescription Writing Assistant.
Your task is to accurately transcribe a raw, noisy doctor-patient conversation into a highly professional, structured clinical prescription.

RAW TRANSCRIPT:
"""${transcript}"""

MAPPED MEDICATIONS (Candidates):
${JSON.stringify(mappedDrugs, null, 2)}

DETAILED INSTRUCTIONS:

1. PATIENT DEMOGRAPHICS & CLINICAL DETAILS:
   - Extract Patient Name, Age, and Gender if mentioned. If absent, use "N/A".
   - Professionally summarize the "chief_complaint" and "hpi" (History of Present Illness) using standard medical terminology.
   - Format vitals cleanly with units if mentioned (e.g., "BP: 120/80 mmHg", "Temp: 98.6 F"). Leave as "N/A" if absent.

  2. MEDICATION SELECTION (ENTITY RESOLUTION):
     - You are provided with a JSON of extracted words and their top database matches.
     - For each medication, comprehensively evaluate ALL provided matches.
     - STEP 1: Evaluate the phonetic and fuzzy matches to find the candidate that most closely resembles the spoken medication name in the transcript.
     - STEP 2: Give HIGHER priority and weightage to 'top_phonetic' matches, as they are phonetically identical to what the doctor spoke (bypassing STT spelling errors).
     - STEP 3: Pay CLOSE ATTENTION to ALL qualifiers in the extracted name (e.g., numbers like "30", "500", or words like "Trio", "Plus", "Forte", "XR"). If the transcript contains these qualifiers, you MUST pick the database match that also contains them, even if it has a slightly lower score!
     - CRITICAL: You MUST pick an exact 'brand_name' from the provided arrays. NEVER output the 'original_extracted_word'. Do NOT invent or guess medication names.

3. DOSAGE & ADMINISTRATION:
   - **dose**: Extract the exact quantity to consume at one time (e.g., "1 Tablet", "10 ml", "50 mg", "2 puffs"). If not spoken, use "As directed".
   - **route**: Infer this logically from the selected brand_name. (e.g., Tablet/Capsule/Syrup -> "Oral", Injection -> "Subcutaneous / IM / IV", Cream/Ointment -> "Topical", Inhaler -> "Inhalation").
   - **frequency**: Strictly normalize medical abbreviations:
      * "OD" -> "Once daily (OD)"
      * "BD" / "BID" -> "Twice daily (BD)"
      * "TDS" / "TID" -> "Three times a day (TDS)"
      * "QID" -> "Four times a day (QID)"
      * "HS" -> "At bedtime (HS)"
      * "SOS" -> "As needed (SOS)"
      * If none is mentioned, use "As directed".
   - **duration**: How long to take the medication (e.g., "5 days", "1 month"). If absent, use "N/A".
   - **instructions**: Extract situational instructions (e.g., "After meals", "Before meals", "Empty stomach", "With warm water"). Do NOT write the dose here. If absent, use "N/A".

4. FORMATTING RULES:
   - Return the exact JSON structure below, and NOTHING else. 
   - Do NOT wrap the JSON in markdown code blocks (e.g., using code blocks). Just output the raw JSON string.

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
      "medicine": "Exact brand_name from mapped list",
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
            temperature: 0.3
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (res.data.usage) {
            const inTokens = res.data.usage.prompt_tokens || 0;
            const outTokens = res.data.usage.completion_tokens || 0;
            const cost = (inTokens / 1000 * 0.001) + (outTokens / 1000 * 0.002);
            console.log(`[MedGemma] Prescription Cost: $${cost.toFixed(6)} (In: ${inTokens}, Out: ${outTokens})`);
            await logMedGemmaUsage('Prescription Generation', inTokens, outTokens, cost).catch(e => console.error('Failed to log MedGemma usage:', e));
        }

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
