import { Request, Response } from 'express';
import { extractDrugs, mapDrugsToDatabase, generatePrescription } from '../services/prescription.service';
import { savePrescription, getPrescriptions, getPrescriptionById } from '../services/db.service';

export const handleExtractDrugs = async (req: Request, res: Response) => {
    try {
        const { transcript } = req.body;
        if (!transcript) return res.status(400).json({ error: 'Transcript is required' });

        const extracted = await extractDrugs(transcript);
        res.json({ extracted });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Failed to extract drugs' });
    }
};

export const handleMapDrugs = (req: Request, res: Response) => {
    try {
        const { extractedDrugs } = req.body;
        if (!extractedDrugs || !Array.isArray(extractedDrugs)) {
            return res.status(400).json({ error: 'extractedDrugs array is required' });
        }

        const mapped = mapDrugsToDatabase(extractedDrugs);
        res.json({ mapped });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Failed to map drugs' });
    }
};

export const handleGeneratePrescription = async (req: Request, res: Response) => {
    try {
        const { transcript, mappedDrugs } = req.body;
        if (!transcript || !mappedDrugs) {
            return res.status(400).json({ error: 'transcript and mappedDrugs are required' });
        }

        const { html, patientName, diagnosis } = await generatePrescription(transcript, mappedDrugs);

        res.json({ html, patientName, diagnosis });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Failed to generate prescription' });
    }
};

export const handleSavePrescription = async (req: Request, res: Response) => {
    try {
        const { html, patientName, diagnosis, transcription } = req.body;
        if (!html) return res.status(400).json({ error: 'HTML content is required' });

        const id = await savePrescription(patientName, diagnosis, html, transcription);
        res.json({ success: true, id });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Failed to save prescription' });
    }
};

export const handleGetHistory = async (req: Request, res: Response) => {
    try {
        const history = await getPrescriptions();
        res.json({ history });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Failed to fetch prescription history' });
    }
};

export const handleGetHistoryById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

        const prescription = await getPrescriptionById(id);
        if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
        
        res.send(prescription.html_content);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Failed to fetch prescription' });
    }
};
