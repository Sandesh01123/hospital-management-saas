import express from 'express'
import { searchPatients, getPatientById, getPatientHistory, createPatient } from '../controllers/patientController'
import { validatePatient, handleValidationErrors } from '../middleware/validation'
import { auditLogger } from '../middleware/auditLog'
import { tenantMiddleware } from '../middleware/tenant'

const router = express.Router()

router.post('/', tenantMiddleware, validatePatient, handleValidationErrors, auditLogger('CREATE_PATIENT', 'patients'), createPatient)
router.get('/search', tenantMiddleware, searchPatients)
router.get('/:id', tenantMiddleware, getPatientById)
router.get('/:id/history', tenantMiddleware, getPatientHistory)

export default router
