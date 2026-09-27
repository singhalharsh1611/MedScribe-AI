import axios from 'axios';
import path from 'path';
import pool, { logMedGemmaUsage } from './db.service';
import {
    buildDrugMatchIndex,
    compactIdentityText,
    DrugMatchIndex,
    IndexedDrug,
    inferDosageForm,
    normalizeIdentityText,
    parseDrugIdentity,
    parseStrengthComponents,
    rankDrugCandidates,
    RankedDrugCandidate,
    StrengthComponent,
} from './drug-matching.service';
import { drugMatchingPool } from './drug-matching-pool.service';

export interface ExtractedMedication {
    spoken_name: string;
    strength: string;
    dosage_form?: string;
    qualifiers?: string[];
    release_type?: string | string[];
    strength_components?: StrengthComponent[];
    alternatives?: string[];
    extraction_confidence?: number;
    dose: string;
    route: string;
    frequency: string;
    duration: string;
    instructions: string;
    source_text: string;
}

let cachedDrugs: DrugMatchIndex | null = null;
let prescriptionInitialization: Promise<IndexedDrug[]> | null = null;
let prescriptionServiceReady = false;

function splitCompactFrequency(name: string, extractedFrequency = 'N/A') {
    const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const suffixes: Array<[string, string]> = [
        ['qid', 'Four times daily (QID)'],
        ['tds', 'Three times daily (TDS)'],
        ['tid', 'Three times daily (TDS)'],
        ['bid', 'Twice daily (BD)'],
        ['bd', 'Twice daily (BD)'],
        ['od', 'Once daily (OD)'],
        ['hs', 'At bedtime (HS)'],
        ['sos', 'As needed (SOS)'],
    ];

    for (const [suffix, frequency] of suffixes) {
        const frequencySupportsSplit = extractedFrequency.toLowerCase().includes(suffix)
            || extractedFrequency.toLowerCase().includes(frequency.toLowerCase());
        if (frequencySupportsSplit && normalized.endsWith(suffix) && normalized.length - suffix.length >= 4) {
            return { medicine: normalized.slice(0, -suffix.length), frequency };
        }
    }
    return { medicine: name.trim(), frequency: 'N/A' };
}

export function initPrescriptionService() {
    if (prescriptionInitialization) return prescriptionInitialization;
    if (cachedDrugs && prescriptionServiceReady) return Promise.resolve(cachedDrugs.list);
    prescriptionInitialization = loadPrescriptionService();
    return prescriptionInitialization;
}

export function isPrescriptionServiceReady() {
    return cachedDrugs !== null && prescriptionServiceReady;
}

async function loadPrescriptionService() {
    try {
        console.log('\n[Prescription Service] Loading structured medication search index...');
        let result;
        try {
            result = await pool.query(`
                SELECT
                    d.id, d.brand_name, d.salt,
                    search.normalized_name, search.compact_name, search.compact_identity,
                    search.brand_root, search.dosage_form, search.release_types,
                    search.qualifiers, search.strength_components, search.phonetic_codes,
                    search.parse_status
                FROM drugs d
                LEFT JOIN drug_search_index search ON search.drug_id = d.id
            `);
        } catch (error: any) {
            if (error?.code !== '42P01') throw error;
            console.warn('[Prescription Service] drug_search_index is not migrated; deriving fields in memory.');
            result = await pool.query('SELECT id, brand_name, salt FROM drugs');
        }

        const list: IndexedDrug[] = result.rows.map((row) => {
            const fallback = row.normalized_name == null ? parseDrugIdentity(row.brand_name) : null;
            return {
                id: Number(row.id),
                brand_name: row.brand_name,
                salt: row.salt === 'UNKNOWN_SALT' || !row.salt ? '' : row.salt,
                normalized_name: row.normalized_name ?? fallback!.normalized_name,
                compact_name: row.compact_name ?? fallback!.compact_name,
                compact_identity: row.compact_identity ?? fallback!.compact_identity,
                brand_root: row.brand_root ?? fallback!.brand_root,
                dosage_form: row.normalized_name != null ? (row.dosage_form || 'unknown') : fallback!.dosage_form,
                release_types: Array.isArray(row.release_types) ? row.release_types : fallback!.release_types,
                qualifiers: Array.isArray(row.qualifiers) ? row.qualifiers : fallback!.qualifiers,
                strength_components: Array.isArray(row.strength_components) ? row.strength_components : fallback!.strength_components,
                phonetic_codes: Array.isArray(row.phonetic_codes) ? row.phonetic_codes : fallback!.phonetic_codes,
                parse_status: row.parse_status ?? fallback!.parse_status,
            };
        });
        cachedDrugs = buildDrugMatchIndex(list);

        try {
            const aliases = await pool.query(`
                SELECT alias.drug_id, alias.normalized_alias, alias.compact_alias
                FROM drug_aliases alias
                WHERE alias.verified = TRUE
            `);
            const byId = new Map(list.map((drug) => [drug.id, drug]));
            for (const alias of aliases.rows) {
                const drug = byId.get(Number(alias.drug_id));
                if (!drug) continue;
                const normalized = normalizeIdentityText(alias.normalized_alias);
                const compact = compactIdentityText(alias.compact_alias);
                if (normalized) cachedDrugs.aliasesByNormalized.set(normalized, drug);
                if (compact) cachedDrugs.aliasesByCompact.set(compact, drug);
            }
        } catch (error: any) {
            if (error?.code !== '42P01') throw error;
        }

        await drugMatchingPool.initialize(cachedDrugs);
        prescriptionServiceReady = true;

        console.log(`[Prescription Service] Ready: indexed ${list.length} drug rows in RAM.\n`);
        return cachedDrugs.list;
    } catch (e: any) {
        prescriptionInitialization = null;
        prescriptionServiceReady = false;
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
    if (!query.trim()) return [];
    return rankDrugCandidates(cache, { spoken_name: query }, 50).candidates.map((candidate) => candidate.brand_name);
}

export function searchDrugCandidates(query: string) {
    const cache = getDrugCache();
    if (!cache || !cache.list || !query.trim()) return [];
    return rankDrugCandidates(cache, { spoken_name: query }, 50).candidates;
}

export function isKnownMedicationName(name: string) {
    const cache = getDrugCache();
    if (!cache?.list) return false;
    const normalized = normalizeIdentityText(name);
    const parsed = parseDrugIdentity(name);
    return cache.list.some((drug) => drug.normalized_name === normalized || drug.compact_name === parsed.compact_name);
}

/**
 * STEP 1: Extract suspected medicine names from transcript using MedGemma
 */
export const extractDrugs = async (transcript: string): Promise<ExtractedMedication[]> => {
    const apiKey = process.env.MEDGEMMA_API_KEY;
    const model = process.env.MEDGEMMA_LLM_MODEL || 'medgemma-4b-it';
    const apiUrl = process.env.MEDGEMMA_API_URL || 'https://dr7.api/api/v1/medical/chat/completions';
    
    if (!apiKey) {
        throw new Error('MEDGEMMA_API_KEY is not set in environment variables');
    }

    const systemPrompt = `You extract medication mentions from noisy, run-on doctor dictation. Extraction must remain literal and auditable. Do not prescribe, correct a brand to a database spelling, infer an ingredient, or invent missing dose information.

SEGMENTATION:
- Emit one object for each distinct medicine mention, in transcript order.
- A new dosage-form marker such as tablet, capsule, inhaler, injection, syrup, cream, drops, spray, or respule normally starts a new mention.
- Keep repetitions and self-corrections separate when it is unclear whether the doctor replaced the earlier medicine.
- For an explicit alternative such as "GM or GM2" or "GM/GM2", keep the spoken_name literal and put both choices in alternatives.

IDENTITY:
- spoken_name contains the literal brand words and product qualifiers, excluding form, strength, frequency, duration, and administration instructions.
- dosage_form is the explicitly spoken form: tablet, capsule, inhaler, injection, syrup, suspension, cream, ointment, gel, drops, spray, respule, rotacap, powder, solution, patch, or N/A.
- qualifiers contains identity suffixes such as MF, M, CT, TG, LC, Plus, Forte, GP1, GP2, GM, or GM2. GP1 and GP2 are different products.
- release_type contains an explicitly spoken SR, ER, XR, CR, MR, PR, DR, MD, ODT, or Retard. Never silently add or remove one.

STRENGTH:
- Convert unambiguous number words to digits: "point two five" -> 0.25; "one twenty" -> 120; "six twenty five" -> 625.
- Normalize "oblique" or "slash" between strength values to "/". Example: "forty oblique five oblique twelve point five mg" -> "40/5/12.5 mg".
- strength_components is an ordered array. Copy a shared trailing unit to every component.
- Use an empty strength_components array when no strength is spoken; the zero in the schema is only a type example.
- A number without a spoken unit keeps unit null. Do not add mg.

ADMINISTRATION:
- dose is only the explicitly spoken amount taken at one time. Saying "tablet" does not mean "1 tablet"; use N/A unless a quantity is spoken.
- route may be directly derived from an explicit form: tablet/capsule -> oral, inhaler/respule -> inhalation, cream/ointment -> topical, injection -> injection. Otherwise N/A.
- Normalize OD, BD/BID, TDS/TID, QID, HS, and SOS. Keep combined timing such as OD HS when both are spoken.
- duration and meal/water instructions remain separate.
- source_text must be a short verbatim substring from the input.
- A schedule suffix fused to a brand may be separated only when the schedule is clear from context.
- OMIT any field that is N/A or empty. Do NOT output "N/A", "[]", or null. Only include a key if the doctor explicitly spoke a value for it.

Return only valid JSON matching this schema for fields that are actually present:
{"medications":[{"spoken_name":"","strength":"","dosage_form":"","qualifiers":[],"release_type":[],"strength_components":[{"position":1,"value":0,"unit":""}],"alternatives":[],"extraction_confidence":0,"dose":"","route":"","frequency":"","duration":"","instructions":"","source_text":""}]}`;

    const medGemmaStartedAt = performance.now();
    const response = await axios.post(apiUrl, {
        model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Capsule Nexaro RD forty mg OD half hour before breakfast. Inhaler Aeroclear two hundred two puffs BD." },
            { role: "assistant", content: "{\"medications\":[{\"spoken_name\":\"Nexaro RD\",\"strength\":\"40 mg\",\"dosage_form\":\"capsule\",\"qualifiers\":[\"RD\"],\"strength_components\":[{\"position\":1,\"value\":40,\"unit\":\"mg\"}],\"extraction_confidence\":0.98,\"route\":\"oral\",\"frequency\":\"Once daily (OD)\",\"instructions\":\"30 minutes before breakfast\",\"source_text\":\"Capsule Nexaro RD forty mg OD half hour before breakfast\"},{\"spoken_name\":\"Aeroclear\",\"strength\":\"200\",\"dosage_form\":\"inhaler\",\"strength_components\":[{\"position\":1,\"value\":200}],\"extraction_confidence\":0.97,\"dose\":\"2 puffs\",\"route\":\"inhalation\",\"frequency\":\"Twice daily (BD)\",\"source_text\":\"Inhaler Aeroclear two hundred two puffs BD\"}]}" },
            { role: "user", content: transcript }
        ],
        max_tokens: 8000,
        temperature: 0
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        }
    });
    console.info(`[Prescription Timing] MedGemma NER request: ${(performance.now() - medGemmaStartedAt).toFixed(1)}ms`);

    try {
        if (response.data.usage) {
            const inTokens = response.data.usage.prompt_tokens || 0;
            const outTokens = response.data.usage.completion_tokens || 0;
            const cost = (inTokens / 1000 * 0.001) + (outTokens / 1000 * 0.002);
            console.log(`[MedGemma] NER Cost: $${cost.toFixed(6)} (In: ${inTokens}, Out: ${outTokens})`);
            await logMedGemmaUsage('NER Extraction', inTokens, outTokens, cost).catch(e => console.error('Failed to log MedGemma usage:', e));
        }

        const normalizationStartedAt = performance.now();
        const content = response.data.choices[0].message.content;
        const cleanedContent = typeof content === 'string' ? content.replace(/```json|```/gi, '').trim() : '';
        const objectStart = cleanedContent.indexOf('{');
        const arrayStart = cleanedContent.indexOf('[');
        const jsonStart = objectStart === -1 ? arrayStart : arrayStart === -1 ? objectStart : Math.min(objectStart, arrayStart);
        const jsonEnd = Math.max(cleanedContent.lastIndexOf('}'), cleanedContent.lastIndexOf(']'));
        if (jsonStart === -1 || jsonEnd < jsonStart) throw new Error('No JSON payload found');
        const jsonStr = cleanedContent.slice(jsonStart, jsonEnd + 1);
        const extracted = JSON.parse(jsonStr);
        const medications = Array.isArray(extracted) ? extracted : extracted.medications;
        if (!Array.isArray(medications)) return [];
        const normalizedMedications = medications.filter((item) => item && typeof item.spoken_name === 'string').map((item) => {
            const frequency = typeof item.frequency === 'string' ? item.frequency : 'N/A';
            const compact = splitCompactFrequency(item.spoken_name, frequency);
            const dosageForm = typeof item.dosage_form === 'string' && item.dosage_form !== 'N/A'
                ? item.dosage_form
                : inferDosageForm(item.source_text || '');
            const strength = typeof item.strength === 'string' ? item.strength : 'N/A';
            const parsedStrengths = strength !== 'N/A' && Array.isArray(item.strength_components)
                ? item.strength_components.filter((component: any) => Number.isFinite(Number(component?.value))).map((component: any, index: number) => ({
                    position: index + 1,
                    value: Number(component.value),
                    unit: typeof component.unit === 'string' ? component.unit.toLowerCase() : null,
                }))
                : strength === 'N/A' ? [] : parseStrengthComponents(strength);
            const proposedSource = typeof item.source_text === 'string' ? item.source_text.trim() : '';
            const sourceText = proposedSource && transcript.includes(proposedSource) ? proposedSource : item.spoken_name;
            const extractionConfidence = Number(item.extraction_confidence);
            return {
            spoken_name: compact.medicine,
            strength,
            dosage_form: dosageForm,
            qualifiers: Array.isArray(item.qualifiers) ? item.qualifiers.filter((value: unknown) => typeof value === 'string') : [],
            release_type: Array.isArray(item.release_type) ? item.release_type.filter((value: unknown) => typeof value === 'string') : [],
            strength_components: parsedStrengths,
            alternatives: Array.isArray(item.alternatives) ? item.alternatives.filter((value: unknown) => typeof value === 'string') : [],
            extraction_confidence: Number.isFinite(extractionConfidence) ? Math.max(0, Math.min(1, extractionConfidence)) : 0,
            dose: (() => {
                if (item.dose && item.dose !== 'N/A') return item.dose;
                // Infer a sensible default dose from the dosage form
                const form = dosageForm?.toLowerCase() || '';
                if (form === 'tablet' || form === 'capsule')    return '1 ' + form;
                if (form === 'syrup' || form === 'suspension')  return '5 ml';
                if (form === 'drops')                           return '2 drops';
                if (form === 'spray')                           return '1–2 sprays';
                if (form === 'patch')                           return '1 patch';
                if (form === 'cream' || form === 'ointment' || form === 'gel') return 'Apply thin layer';
                return 'N/A';
            })(),
            route: (() => {
                if (item.route && item.route !== 'N/A') return item.route;
                // Infer route from dosage form
                const form = dosageForm?.toLowerCase() || '';
                if (form === 'tablet' || form === 'capsule' || form === 'syrup' ||
                    form === 'suspension' || form === 'solution' || form === 'powder')   return 'Oral';
                if (form === 'inhaler' || form === 'respule' || form === 'rotacap')      return 'Inhalation';
                if (form === 'injection')                                                return 'Injection';
                if (form === 'cream' || form === 'ointment' || form === 'gel')          return 'Topical';
                if (form === 'drops')                                                   return 'Topical / Instillation';
                if (form === 'spray')                                                   return 'Nasal / Topical';
                if (form === 'patch')                                                   return 'Transdermal';
                return 'N/A';
            })(),
            frequency: frequency !== 'N/A' ? frequency : compact.frequency,
            duration: item.duration || 'N/A',
            instructions: item.instructions || 'N/A',
            source_text: sourceText,
            };
        });
        console.info(`[Prescription Timing] NER parse and normalization: ${(performance.now() - normalizationStartedAt).toFixed(1)}ms (${normalizedMedications.length} medication(s))`);
        return normalizedMedications;
    } catch (e) {
        console.error('Failed to parse LLM output as JSON', {
            error: e instanceof Error ? e.message : e,
            content: response.data?.choices?.[0]?.message?.content,
            finish_reason: response.data?.choices?.[0]?.finish_reason,
        });
        return [];
    }
};

/**
 * STEP 2: Map extracted drug names using HYBRID Phonetic + Sørensen–Dice Search
 */
export const mapDrugsToDatabase = async (extractedDrugs: Array<string | ExtractedMedication>) => {
    const cache = getDrugCache();
    if (!cache || !cache.list || cache.list.length === 0) {
        throw new Error('Drug database is empty or not initialized.');
    }

    const prepared = extractedDrugs.map((extractedItem) => {
        const extractedWord = typeof extractedItem === 'string' ? extractedItem : extractedItem.spoken_name;
        const request = typeof extractedItem === 'string'
            ? { spoken_name: extractedItem }
            : {
                spoken_name: extractedItem.spoken_name,
                strength: extractedItem.strength,
                dosage_form: extractedItem.dosage_form,
                route: extractedItem.route,
                source_text: extractedItem.source_text,
                instructions: extractedItem.instructions,
                qualifiers: extractedItem.qualifiers,
                release_type: extractedItem.release_type,
                strength_components: extractedItem.strength_components,
            };
        return { extractedItem, extractedWord, request };
    });
    const results = await drugMatchingPool.match(prepared.map((item) => item.request), 12);

    return prepared.map(({ extractedItem, extractedWord }, index) => {
        const result = results[index];
        const candidateView = (candidate: RankedDrugCandidate) => ({
            id: candidate.id,
            brand_name: candidate.brand_name,
            salt: candidate.salt,
            match_type: candidate.match_type,
            score: candidate.score,
            confidence: candidate.confidence,
            phonetic_code: candidate.phonetic_code,
            dosage_form: candidate.dosage_form,
            qualifiers: candidate.qualifiers,
            release_types: candidate.release_types,
            strength_components: candidate.strength_components,
            compatible: candidate.compatible,
            auto_selectable: candidate.auto_selectable,
            evidence: candidate.evidence,
            conflicts: candidate.conflicts,
            review_reasons: candidate.review_reasons,
        });
        const phonetic = result.candidates.filter((candidate: RankedDrugCandidate) =>
            candidate.match_type === 'Phonetic' || candidate.match_type === 'Near-Phonetic');
        return {
            ...(typeof extractedItem === 'string' ? {} : extractedItem),
            original_extracted_word: extractedWord,
            normalized_request: result.request,
            selection_status: result.selection_status,
            score_margin: result.score_margin,
            recommended_candidate: result.recommended_candidate ? candidateView(result.recommended_candidate) : null,
            review_candidate: result.review_candidate ? candidateView(result.review_candidate) : null,
            candidates: result.candidates.slice(0, 8).map(candidateView),
            top_phonetic: phonetic.slice(0, 6).map(candidateView),
            top_fuzzy: result.candidates.slice(0, 6).map(candidateView),
        };
    });
};


export function validateMedicationSelections(prescriptionData: any, mappedDrugs: any[]) {
    const generated = Array.isArray(prescriptionData?.medications) ? prescriptionData.medications : [];
    prescriptionData.medications = mappedDrugs.map((mapped, index) => {
        const llmMedication = generated[index] && typeof generated[index] === 'object' ? generated[index] : {};
        const candidates = Array.isArray(mapped.candidates) ? mapped.candidates : [];
        const compatibleCandidates = candidates
            .filter((candidate: any) => candidate.compatible && (!Array.isArray(candidate.conflicts) || candidate.conflicts.length === 0))
            .sort((left: any, right: any) => Number(right.score || 0) - Number(left.score || 0));
        const bestCompatible = compatibleCandidates[0] || null;
        const requestedId = llmMedication.selected_candidate_id == null
            ? null
            : Number(llmMedication.selected_candidate_id);
        const requestedCandidate = requestedId !== null && Number.isFinite(requestedId)
            ? compatibleCandidates.find((candidate: any) => Number(candidate.id) === requestedId)
            : null;
        const clinicianSelectedId = mapped.clinician_selected_candidate_id == null
            ? null
            : Number(mapped.clinician_selected_candidate_id);
        const clinicianSelected = clinicianSelectedId !== null && Number.isFinite(clinicianSelectedId)
            ? candidates.find((candidate: any) => Number(candidate.id) === clinicianSelectedId)
            : null;
        const recommended = mapped.recommended_candidate?.compatible ? mapped.recommended_candidate : null;
        const protectedExact = bestCompatible && ['Exact', 'Alias', 'Compact'].includes(bestCompatible.match_type)
            ? bestCompatible
            : null;
        const lockedCandidate = recommended || protectedExact;
        const requestedScoreGap = requestedCandidate && bestCompatible
            ? Number(bestCompatible.score || 0) - Number(requestedCandidate.score || 0)
            : Number.POSITIVE_INFINITY;
        const llmCandidate = requestedCandidate && (
            !lockedCandidate
                ? requestedScoreGap <= 5
                : Number(requestedCandidate.id) === Number(lockedCandidate.id)
        ) ? requestedCandidate : null;
        const selected = clinicianSelected || lockedCandidate || llmCandidate;
        const spokenName = mapped.spoken_name || mapped.original_extracted_word || 'Unknown medicine';
        if (!selected) {
            return {
                medicine: `Unresolved: ${spokenName}`,
                selected_candidate_id: null,
                needs_review: true,
                confidence: 0,
                selection_reason: mapped.review_candidate
                    ? `Best database candidate requires review: ${mapped.review_candidate.brand_name}`
                    : 'No compatible database candidate was found',
                dose: mapped.dose || llmMedication.dose || 'N/A',
                route: mapped.route || llmMedication.route || 'N/A',
                frequency: mapped.frequency || llmMedication.frequency || 'N/A',
                duration: mapped.duration || llmMedication.duration || 'N/A',
                instructions: mapped.instructions || llmMedication.instructions || 'N/A',
            };
        }
        const needsReview = clinicianSelected ? false : !selected.auto_selectable || mapped.selection_status !== 'matched';
        const selectionWasCorrected = requestedCandidate
            && Number(requestedCandidate.id) !== Number(selected.id);
        return {
            medicine: selected.brand_name,
            selected_candidate_id: selected.id,
            needs_review: needsReview,
            confidence: selected.confidence,
            selection_reason: selectionWasCorrected
                ? `Backend retained the stronger ${selected.match_type.toLowerCase()} database match over a lower-ranked AI choice`
                : llmMedication.selection_reason || selected.evidence?.join(', ') || 'Database candidate match',
            dose: mapped.dose || llmMedication.dose || 'N/A',
            route: mapped.route || llmMedication.route || selected.dosage_form || 'N/A',
            frequency: mapped.frequency || llmMedication.frequency || 'N/A',
            duration: mapped.duration || llmMedication.duration || 'N/A',
            instructions: mapped.instructions || llmMedication.instructions || 'N/A',
        };
    });
    return prescriptionData;
}

export const generatePrescription = async (transcript: string, mappedDrugs: any[]) => {
    console.log('[Prescription Service] Generating final prescription via MedGemma...');
    
    // 1. Build prompt for MedGemma
    const selectionInputText = mappedDrugs.map((mapped, index) => {
        let candidates = Array.isArray(mapped.candidates) ? mapped.candidates : [];
        if (mapped.clinician_selected_candidate_id) {
            candidates = candidates.filter((c: any) => c.id === mapped.clinician_selected_candidate_id);
        } else if (mapped.selection_status === 'matched' && mapped.recommended_candidate) {
            candidates = candidates.filter((c: any) => c.id === mapped.recommended_candidate.id);
        } else {
            candidates = candidates.slice(0, 4);
        }

        let txt = `Mention ID: ${index + 1}\nSpoken: "${mapped.spoken_name || mapped.original_extracted_word}"`;
        if (mapped.source_text && mapped.source_text !== mapped.spoken_name) txt += ` | Source: "${mapped.source_text}"`;
        if (mapped.dosage_form) txt += ` | Form: ${mapped.dosage_form}`;
        if (mapped.strength) txt += ` | Strength: ${mapped.strength}`;

        txt += `\nCandidates:\n`;
        candidates.forEach((c: any) => {
            txt += `- [ID: ${c.id}] ${c.brand_name} (Score: ${c.score})`;
            if (!c.compatible) txt += ` [INCOMPATIBLE]`;
            if (c.dosage_form && c.dosage_form !== 'unknown') txt += ` | Form: ${c.dosage_form}`;
            if (c.conflicts && c.conflicts.length) txt += ` [HAS CONFLICTS]`;
            txt += `\n`;
        });
        return txt.trim();
    }).join('\n\n');
    const systemPrompt = `You produce a prescription draft from literal extracted medication data and constrained database candidates.

Candidate selection rules:
- Treat each mention independently and preserve input order.
- Select only by selected_candidate_id from that mention's candidates array.
- If clinician_selected_candidate_id is present, select that exact candidate ID. It is an explicit doctor decision and overrides automatic ranking.
- Reject candidates with compatible=false or any conflicts.
- Dosage form, requested qualifiers, explicit release type, and complete visible strength are identity constraints.
- Candidate score is the primary database-ranking evidence. Start with the highest-scored compatible candidate, not with medical familiarity or a guessed medicine class.
- If deterministic_recommended_candidate_id is present, select that candidate. Do not replace it with another candidate.
- You may override the highest-scored compatible candidate only when the score difference between candidates is 5 or less and the literal transcript gives clear spelling or phonetic evidence for the alternative.
- A score difference greater than 5 is material. Do not select the lower-scored candidate unless the higher candidate is marked incompatible or has conflicts.
- Compare the complete brand tokens. A nearly tied candidate that preserves all heard tokens may beat a candidate with a one-letter substitution; for example, a heard “Drotin MF” can support “Drotine MF” over another near-tied spelling.
- When an exact compatible “Triolmesar” candidate is present, do not shorten or substitute it with a different brand such as “Triolmas”.
- A higher spelling score cannot override a form, qualifier, release, or strength conflict.
- Treat selection_status as the deterministic matcher's recommendation, not an automatic rejection. For needs_review and no_match entries, independently compare the literal source_text and spoken_name with every compatible candidate.
- Account for plausible speech-recognition and spelling errors, phonetic similarity, word boundaries, brand qualifiers, dosage form, release type, and explicitly spoken strength. Use medical knowledge only to interpret the heard brand name and candidate identities; do not invent an indication or medicine.
- You may select one compatible candidate for a needs_review or no_match entry when the transcript and candidate evidence make it clearly more plausible than the alternatives. Set needs_review true for that AI-resolved selection so a clinician can verify it.
- If no compatible candidate exists, or two or more candidates remain materially ambiguous after considering the transcript, return selected_candidate_id null and needs_review true. Never force a guess.
- Do not invent or return a medicine name. Backend code resolves the selected ID to the exact database name.
- Extract patient and clinical fields only when present; otherwise use N/A.

Return valid JSON only, with exactly one medication for every input mention.`;
    const prompt = `RAW TRANSCRIPT:
"""${transcript}"""

EXTRACTED MEDICATIONS AND DATABASE CANDIDATES:
${selectionInputText}

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
      "mention_id": 1,
      "selected_candidate_id": null,
      "needs_review": true,
      "selection_reason": ""
    }
  ]
}`;

    console.log('[DEBUG] Transcript length:', transcript.length);
    console.log('[DEBUG] selectionInputText length:', selectionInputText.length);
    console.log('[DEBUG] Prompt total length:', prompt.length);

    // 2. Call MedGemma
    const apiKey = process.env.MEDGEMMA_API_KEY;
    const model = process.env.MEDGEMMA_LLM_MODEL || 'medgemma-4b-it';
    const apiUrl = process.env.MEDGEMMA_API_URL || 'https://dr7.ai/api/v1/medical/chat/completions';
    
    if (!apiKey) {
        throw new Error('MEDGEMMA_API_KEY is not set in environment variables');
    }

    let aiResponse;
    try {
        const res = await axios.post(apiUrl, {
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
            ],
            max_tokens: 8000,
            temperature: 0
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
        prescriptionData = validateMedicationSelections(JSON.parse(cleanJson), mappedDrugs);
    } catch (e) {
        throw new Error('LLM returned invalid JSON for prescription.');
    }

    return { 
        html: null, 
        patientName: prescriptionData.patient_name || 'Unknown', 
        diagnosis: prescriptionData.final_diagnosis || prescriptionData.differential_diagnosis || 'Unknown',
        prescriptionData
    };
};
