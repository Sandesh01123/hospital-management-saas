import express from 'express'
import { createMedicalRecord, getMedicalRecords, updateBillingStatus } from '../controllers/medicalRecordController'
import { validateMedicalRecord, handleValidationErrors } from '../middleware/validation'
import { auditLogger } from '../middleware/auditLog'
import { tenantMiddleware } from '../middleware/tenant'

const router = express.Router()

router.post('/', tenantMiddleware, validateMedicalRecord, handleValidationErrors, createMedicalRecord)
router.get('/', tenantMiddleware, getMedicalRecords)
router.patch('/:id/billing', tenantMiddleware, auditLogger('UPDATE_BILLING', 'medical_records'), updateBillingStatus)

export default router
