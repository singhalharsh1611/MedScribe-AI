import { Request, Response } from 'express';
import { extractDrugs, mapDrugsToDatabase } from '../services/prescription.service';

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
