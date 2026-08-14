jest.mock('../lib/supabaseClient')
jest.mock('../middleware/auditLog', () => ({
  auditLogger: () => (_req: any, _res: any, next: any) => next()
}))
jest.mock('../middleware/tenant', () => ({
  tenantMiddleware: (_req: any, _res: any, next: any) => next()
}))

import request from 'supertest'
import app from '../index'

describe('Appointments API', () => {
  test('POST /api/appointments without body returns 400', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({})
    expect(res.status).toBe(400)
  })
  test('POST /api/appointments with invalid blood_group returns 400', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .send({
        patient_name: 'Test Patient',
        phone_number: '9876543210',
        age: 30,
        blood_group: 'X+',
        symptoms_summary: 'headache',
        preferred_date: '2026-08-10',
        preferred_time: '10:00'
      })
    expect(res.status).toBe(400)
  })
})
