import express from 'express'
import { createAppointment, getAppointments, updateAppointmentStatus } from '../controllers/appointmentController'
import { validateAppointment, handleValidationErrors } from '../middleware/validation'
import { auditLogger } from '../middleware/auditLog'
import { tenantMiddleware } from '../middleware/tenant'
import { appointmentLimiter } from '../middleware/rateLimiters'

const router = express.Router()

router.post('/', appointmentLimiter, tenantMiddleware, validateAppointment, handleValidationErrors, auditLogger('CREATE_APPOINTMENT', 'appointments'), createAppointment)
router.get('/', tenantMiddleware, getAppointments)
router.patch('/:id/status', tenantMiddleware, auditLogger('UPDATE_APPOINTMENT_STATUS', 'appointments'), updateAppointmentStatus)

export default router
