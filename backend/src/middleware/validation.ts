import { body, validationResult, ValidationChain } from 'express-validator'

/**
 * Validation rules for appointment creation
 * 
 * Validates all required and optional fields for appointment booking.
 * Ensures data types, ranges, and formats are correct.
 */
export const validateAppointment: ValidationChain[] = [
  body('patient_name')
    .trim()
    .notEmpty()
    .withMessage('Patient name is required')
    .isLength({ max: 255 })
    .withMessage('Patient name must be less than 255 characters'),
  
  body('phone_number')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[+]?[0-9]{10,15}$/)
    .withMessage('Invalid phone number format'),
  
  body('age')
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be between 0 and 150'),
  
  body('blood_group')
    .trim()
    .notEmpty()
    .withMessage('Blood group is required')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group'),
  
  body('symptoms_summary')
    .trim()
    .notEmpty()
    .withMessage('Symptoms summary is required')
    .isLength({ max: 2000 })
    .withMessage('Symptoms summary must be less than 2000 characters'),
  
  body('preferred_date')
    .optional()
    .trim()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Invalid date format (YYYY-MM-DD)'),
  
  body('preferred_time')
    .optional()
    .trim()
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('Invalid time format (HH:MM)'),
  
  body('temperature_f')
    .optional()
    .isFloat({ min: 90, max: 115 })
    .withMessage('Temperature must be between 90 and 115°F'),
  
  body('blood_pressure_systolic')
    .optional()
    .isInt({ min: 50, max: 250 })
    .withMessage('Systolic BP must be between 50 and 250'),
  
  body('blood_pressure_diastolic')
    .optional()
    .isInt({ min: 30, max: 150 })
    .withMessage('Diastolic BP must be between 30 and 150'),
  
  body('pulse_rate')
    .optional()
    .isInt({ min: 30, max: 200 })
    .withMessage('Pulse rate must be between 30 and 200'),
  
  body('spo2_percent')
    .optional()
    .isFloat({ min: 70, max: 100 })
    .withMessage('SpO2 must be between 70 and 100%'),
]

/**
 * Validation rules for patient creation
 * 
 * Validates patient demographic and contact information.
 */
export const validatePatient: ValidationChain[] = [
  body('patient_name')
    .trim()
    .notEmpty()
    .withMessage('Patient name is required')
    .isLength({ max: 255 })
    .withMessage('Patient name must be less than 255 characters'),
  
  body('phone_number')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[+]?[0-9]{10,15}$/)
    .withMessage('Invalid phone number format'),
  
  body('age')
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be between 0 and 150'),
  
  body('blood_group')
    .trim()
    .notEmpty()
    .withMessage('Blood group is required')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group'),
  
  body('address')
    .optional()
    .isString()
    .withMessage('Address must be a string'),
  
  body('emergency_contact')
    .optional()
    .matches(/^[+]?[0-9]{10,15}$/)
    .withMessage('Invalid emergency contact format'),
]

/**
 * Validation rules for medical record creation
 * 
 * Validates medical record fields including billing information.
 */
export const validateMedicalRecord: ValidationChain[] = [
  body('patient_id')
    .notEmpty()
    .withMessage('Patient ID is required')
    .isUUID()
    .withMessage('Invalid patient ID format'),
  
  body('appointment_id')
    .optional()
    .isUUID()
    .withMessage('Invalid appointment ID format'),
  
  body('billing_status')
    .optional()
    .isIn(['Pending', 'Paid', 'Cancelled'])
    .withMessage('Invalid billing status'),
  
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
]

/**
 * Middleware to handle validation errors
 * 
 * Checks if there are any validation errors from express-validator.
 * Returns 400 with error details if validation fails.
 * Continues to next middleware if validation passes.
 */
export const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      errors: errors.array().map((error: any) => ({
        field: error.path,
        message: error.msg
      }))
    })
  }
  next()
}
