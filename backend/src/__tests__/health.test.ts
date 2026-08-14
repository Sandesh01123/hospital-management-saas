jest.mock('../lib/supabaseClient')
jest.mock('../middleware/auditLog', () => ({
  auditLogger: () => (_req: any, _res: any, next: any) => next()
}))
jest.mock('../middleware/tenant', () => ({
  tenantMiddleware: (_req: any, _res: any, next: any) => next()
}))

import request from 'supertest'
import app from '../index'

describe('Health Check', () => {
  test('GET /health returns 200', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
  test('GET /health returns timestamp', async () => {
    const res = await request(app).get('/health')
    expect(res.body.timestamp).toBeDefined()
  })
})
