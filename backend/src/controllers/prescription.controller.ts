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

export const handleSavePrescription = (req: Request, res: Response) => {
    try {
        const { html, patientName, diagnosis } = req.body;
        if (!html) return res.status(400).json({ error: 'HTML content is required' });

        const id = savePrescription(patientName, diagnosis, html);
        res.json({ success: true, id });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Failed to save prescription' });
    }
};

export const handleGetHistory = (req: Request, res: Response) => {
    try {
        const history = getPrescriptions();
        res.json({ history });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Failed to get history' });
    }
};

export const handleGetHistoryById = (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const record = getPrescriptionById(id) as any;
        if (!record) return res.status(404).json({ error: 'Not found' });
        res.send(record.html_content);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Failed to get prescription' });
    }
};
