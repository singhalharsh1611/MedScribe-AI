import { getRedisClient } from '../services/redis.service';
import { Request, Response } from 'express';
import { extractDrugs, mapDrugsToDatabase, generatePrescription, isPrescriptionServiceReady } from '../services/prescription.service';
import { savePrescription, getPrescriptions, getPrescriptionById } from '../services/db.service';
import { getPrincipal } from '../middleware/auth.middleware';
import { sendServerError } from '../utils/http-error';
import axios from 'axios';

const clinicUser = (req: Request, res: Response) => {
    const principal = getPrincipal(req);
    if (!principal || principal.kind !== 'user' || principal.clinicId === null) {
        res.status(403).json({ error: 'Clinic membership is required' });
        return null;
    }
    return principal;
};

export const handleExtractDrugs = async (req: Request, res: Response) => {
    try {
        const { transcript } = req.body;
        if (!transcript) return res.status(400).json({ error: 'Transcript is required' });

        const extracted = await extractDrugs(transcript);
        res.json({ extracted });
    } catch (error) {
        sendServerError(res, 'PRESCRIPTION_EXTRACT_FAILED', 'Unable to extract medications.', error);
    }
};

export const handleMapDrugs = async (req: Request, res: Response) => {
    try {
        if (!isPrescriptionServiceReady()) return res.status(503).json({ code: 'PRESCRIPTION_CATALOG_LOADING', error: 'The medication catalog is still loading. Try again shortly.' });
        const { extractedDrugs } = req.body;
        if (!extractedDrugs || !Array.isArray(extractedDrugs)) {
            return res.status(400).json({ error: 'extractedDrugs array is required' });
        }

        const mappingStartedAt = performance.now();
        const { mapDrugsToDatabase } = require('../services/prescription.service');
        const mapped = await mapDrugsToDatabase(extractedDrugs);
        console.info(`[Prescription Timing] Standalone catalog matching: ${(performance.now() - mappingStartedAt).toFixed(1)}ms (${mapped.length} medication(s))`);
        
        res.json({ mapped });
    } catch (error) {
        sendServerError(res, 'PRESCRIPTION_MAP_FAILED', 'Unable to map medications.', error);
    }
};

export const handleExtractAndMapDrugs = async (req: Request, res: Response) => {
    try {
        if (!isPrescriptionServiceReady()) return res.status(503).json({ code: 'PRESCRIPTION_CATALOG_LOADING', error: 'The medication catalog is still loading. Try again shortly.' });
        const { transcript } = req.body;
        if (!transcript) return res.status(400).json({ error: 'Transcript is required' });

        const requestStartedAt = performance.now();
        const extractionStartedAt = performance.now();
        const extracted = await extractDrugs(transcript);
        console.info(`[Prescription Timing] Full NER extraction stage: ${(performance.now() - extractionStartedAt).toFixed(1)}ms`);
        const matchingStartedAt = performance.now();
        const mapped = await mapDrugsToDatabase(extracted);
        console.info(`[Prescription Timing] In-memory catalog matching: ${(performance.now() - matchingStartedAt).toFixed(1)}ms (${mapped.length} medication(s))`);
        const unmatched = mapped
            .filter((medication) => medication.selection_status === 'no_match')
            .map((medication) => ({
                spoken_name: medication.spoken_name || medication.original_extracted_word,
                strength: medication.strength,
                dosage_form: medication.dosage_form,
                candidates: medication.candidates.length,
            }));
        console.info(`[Prescription Matching] No safe match (${unmatched.length}): ${JSON.stringify(unmatched)}`);
        res.json({ extracted, mapped });
        console.info(`[Prescription Timing] extract-and-map total: ${(performance.now() - requestStartedAt).toFixed(1)}ms`);
    } catch (error) {
        sendServerError(res, 'PRESCRIPTION_EXTRACT_MAP_FAILED', 'Unable to process medications.', error);
    }
};

export const handleGeneratePrescription = async (req: Request, res: Response) => {
    try {
        const { transcript, mappedDrugs } = req.body;
        if (!transcript || !mappedDrugs) {
            return res.status(400).json({ error: 'transcript and mappedDrugs are required' });
        }

        const { html, patientName, diagnosis, prescriptionData } = await generatePrescription(transcript, mappedDrugs);

        res.json({ html, patientName, diagnosis, prescriptionData });
    } catch (error) {
        sendServerError(res, 'PRESCRIPTION_GENERATE_FAILED', 'Unable to generate the prescription draft.', error);
    }
};

export const handleSavePrescription = async (req: Request, res: Response) => {
    try {
        const principal = clinicUser(req, res);
        if (!principal) return;
        const { html, patientName, diagnosis, transcription, audioUrl } = req.body;
        if (!html) return res.status(400).json({ error: 'HTML content is required' });

        const id = await savePrescription(patientName, diagnosis, html, transcription, audioUrl, principal.clinicId!, principal.id);
        res.json({ success: true, id });
    } catch (error) {
        sendServerError(res, 'PRESCRIPTION_SAVE_FAILED', 'Unable to save the prescription.', error);
    }
};

export const handleGetHistory = async (req: Request, res: Response) => {
    try {
        const principal = clinicUser(req, res);
        if (!principal) return;
        
        const cacheKey = `history:clinic:${principal.clinicId}`;
        const redis = getRedisClient();
        const cached = await redis.get(cacheKey);
        if (cached) {
            return res.json({ history: JSON.parse(cached) });
        }
        
        const history = await getPrescriptions(principal.clinicId!);
        await redis.setex(cacheKey, 60, JSON.stringify(history)); // cache for 60 seconds
        
        res.json({ history });
    } catch (error) {
        sendServerError(res, 'PRESCRIPTION_HISTORY_READ_FAILED', 'Unable to load prescription history.', error);
    }
};

export const handleGetHistoryById = async (req: Request, res: Response) => {
    try {
        const principal = clinicUser(req, res);
        if (!principal) return;
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

        const prescription = await getPrescriptionById(id, principal.clinicId!);
        if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
        
        res.send(prescription.html_content);
    } catch (error) {
        sendServerError(res, 'PRESCRIPTION_READ_FAILED', 'Unable to load the prescription.', error);
    }
};

export const handleGetPrescriptionRecord = async (req: Request, res: Response) => {
    try {
        const principal = clinicUser(req, res);
        if (!principal) return;
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ code: 'INVALID_PRESCRIPTION_ID', error: 'Invalid prescription ID.' });
        }

        const cacheKey = `prescription:record:${id}:clinic:${principal.clinicId}`;
        const redis = getRedisClient();
        const cached = await redis.get(cacheKey);
        if (cached) {
            return res.json({ prescription: JSON.parse(cached) });
        }

        const prescription = await getPrescriptionById(id, principal.clinicId!);
        if (!prescription) {
            return res.status(404).json({ code: 'PRESCRIPTION_NOT_FOUND', error: 'Prescription not found.' });
        }
        
        await redis.setex(cacheKey, 300, JSON.stringify(prescription)); // cache for 5 minutes
        
        res.json({ prescription });
    } catch (error) {
        sendServerError(res, 'PRESCRIPTION_READ_FAILED', 'Unable to load the prescription.', error);
    }
};

export const handleSendPrescription = async (req: Request, res: Response) => {
    try {
        const principal = clinicUser(req, res);
        if (!principal) return;
        if (!['doctor', 'admin'].includes(principal.role)) {
            return res.status(403).json({ code: 'PRESCRIPTION_DELIVERY_FORBIDDEN', error: 'Only a doctor or clinic administrator can send a prescription.' });
        }
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ code: 'INVALID_PRESCRIPTION_ID', error: 'Invalid prescription ID.' });
        }
        const prescription = await getPrescriptionById(id, principal.clinicId!);
        if (!prescription) {
            return res.status(404).json({ code: 'PRESCRIPTION_NOT_FOUND', error: 'Prescription not found.' });
        }
        if (!prescription.phone && !prescription.email) {
            return res.status(409).json({ code: 'PATIENT_CONTACT_MISSING', error: 'The patient has no phone number or email address on file.' });
        }
        const webhookUrl = process.env.PATIENT_DELIVERY_WEBHOOK_URL;
        if (!webhookUrl) {
            return res.status(503).json({ code: 'PRESCRIPTION_DELIVERY_NOT_CONFIGURED', error: 'Patient prescription delivery is not configured.' });
        }

        const response = await axios.post(webhookUrl, {
            event: 'prescription.finalized',
            prescription: {
                id: prescription.id,
                serial: prescription.serial,
                timestamp: prescription.timestamp,
                diagnosis: prescription.diagnosis,
                data: prescription.prescription_data,
            },
            patient: {
                id: prescription.patient_id,
                name: prescription.patient_name,
                phone: prescription.phone,
                email: prescription.email,
            },
        }, {
            timeout: 10000,
            headers: process.env.PATIENT_DELIVERY_WEBHOOK_SECRET
                ? { Authorization: `Bearer ${process.env.PATIENT_DELIVERY_WEBHOOK_SECRET}` }
                : undefined,
        });
        if (response.data?.delivered !== true) {
            throw new Error('Delivery provider response did not confirm delivery');
        }
        res.json({ delivered: true, delivery_id: response.data?.id || response.data?.delivery_id || null });
    } catch (error) {
        console.error('[PRESCRIPTION_DELIVERY_FAILED]', error);
        res.status(502).json({ code: 'PRESCRIPTION_DELIVERY_FAILED', error: 'The prescription delivery provider did not confirm delivery.' });
    }
};

export const handleSearchDrugs = async (req: Request, res: Response) => {
    try {
        if (!isPrescriptionServiceReady()) return res.status(503).json({ code: 'PRESCRIPTION_CATALOG_LOADING', error: 'The medication catalog is still loading. Try again shortly.' });
        const { q, detailed } = req.query;
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ error: 'Query parameter q is required' });
        }
        
        // Use the preloaded cache for superfast search
        const { searchDrugs, searchDrugCandidates } = await import('../services/prescription.service');
        const results = detailed === '1' ? searchDrugCandidates(q) : searchDrugs(q);
        res.json({ results });
    } catch (error) {
        sendServerError(res, 'DRUG_SEARCH_FAILED', 'Unable to search medications.', error);
    }
};
