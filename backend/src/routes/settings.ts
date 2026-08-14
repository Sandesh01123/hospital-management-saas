import express from 'express'
import { getSettings, updateSettings, uploadLogo } from '../controllers/settingsController'
import { auditLogger } from '../middleware/auditLog'
import { tenantMiddleware } from '../middleware/tenant'

const router = express.Router()

router.get('/', tenantMiddleware, getSettings)
router.put('/', tenantMiddleware, auditLogger('UPDATE_SETTINGS', 'settings'), updateSettings)
router.post('/logo', tenantMiddleware, auditLogger('UPDATE_SETTINGS', 'settings'), uploadLogo)

export default router
