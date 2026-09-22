import { Router } from 'express';
import { handleExtractDrugs, handleExtractAndMapDrugs, handleMapDrugs, handleGeneratePrescription, handleSavePrescription, handleGetHistory, handleGetHistoryById, handleGetPrescriptionRecord, handleSendPrescription, handleSearchDrugs } from '../controllers/prescription.controller';
import { authRateLimit, requireRole, requireRoleOrPermission } from '../middleware/auth.middleware';

const router = Router();

const clinicalPrescriptionAccess = requireRole('doctor', 'admin', 'pharmacist', 'compounder');
const prescriptionReadAccess = requireRoleOrPermission(
  ['doctor', 'admin', 'pharmacist', 'compounder'],
  ['manage_registration', 'manage_appointments'],
);

router.get('/search', clinicalPrescriptionAccess, handleSearchDrugs);
router.post('/extract', clinicalPrescriptionAccess, handleExtractDrugs);
router.post('/extract-and-map', clinicalPrescriptionAccess, handleExtractAndMapDrugs);
router.post('/map', clinicalPrescriptionAccess, handleMapDrugs);
router.post('/generate', clinicalPrescriptionAccess, handleGeneratePrescription);
router.post('/save', clinicalPrescriptionAccess, handleSavePrescription);
router.get('/history', clinicalPrescriptionAccess, handleGetHistory);
router.get('/record/:id', prescriptionReadAccess, handleGetPrescriptionRecord);
router.post('/record/:id/send', clinicalPrescriptionAccess, authRateLimit, handleSendPrescription);
router.get('/history/:id', clinicalPrescriptionAccess, handleGetHistoryById);

export default router;
