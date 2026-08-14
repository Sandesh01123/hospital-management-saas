import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import { generalLimiter } from './middleware/rateLimiters'
import appointmentRoutes from './routes/appointments'
import patientRoutes from './routes/patients'
import medicalRecordRoutes from './routes/medicalRecords'
import settingsRoutes from './routes/settings'

dotenv.config()

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName])
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '))
  console.error('Please set these variables in your .env file')
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 5001

// Security headers
app.use(helmet())

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL?.split(',') 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}))

// Rate limiting
app.use(generalLimiter)
app.use(express.json())

// Routes
app.use('/api/appointments', appointmentRoutes)
app.use('/api/patients', patientRoutes)
app.use('/api/medical-records', medicalRecordRoutes)
app.use('/api/settings', settingsRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Only start server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ Hospital Management SaaS Backend running on port ${PORT}`)
    console.log(`🔒 Security features enabled: Rate limiting, Helmet, Input validation`)
  })
}

export default app
