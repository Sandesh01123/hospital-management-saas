jest.mock('../lib/supabaseClient')
jest.mock('../middleware/auditLog', () => ({
  auditLogger: () => (_req: any, _res: any, next: any) => next()
}))
jest.mock('../middleware/tenant', () => ({
  tenantMiddleware: (_req: any, _res: any, next: any) => next()
}))

import request from 'supertest'
import app from '../index'

describe('Patients API', () => {
  test('POST /api/patients without body returns 400', async () => {
    const res = await request(app)
      .post('/api/patients')
      .send({})
    expect(res.status).toBe(400)
  })
  test('POST /api/patients with invalid phone_number returns 400', async () => {
    const res = await request(app)
      .post('/api/patients')
      .send({
        patient_name: 'Test Patient',
        phone_number: 'invalid',
        age: 30,
        blood_group: 'O+'
      })
    expect(res.status).toBe(400)
  })
})
