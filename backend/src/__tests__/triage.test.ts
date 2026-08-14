jest.mock('../lib/supabaseClient')
jest.mock('../middleware/auditLog', () => ({
  auditLogger: () => (_req: any, _res: any, next: any) => next()
}))
jest.mock('../middleware/tenant', () => ({
  tenantMiddleware: (_req: any, _res: any, next: any) => next()
}))

import { determineTriagePriority } from '../controllers/appointmentController'

describe('Triage Engine — Emergency Keywords', () => {
  test('returns emergency for chest pain', () => {
    expect(determineTriagePriority('chest pain')).toBe('emergency')
  })
  test('returns emergency for heart attack', () => {
    expect(determineTriagePriority('heart attack symptoms')).toBe('emergency')
  })
  test('returns emergency for unconscious patient', () => {
    expect(determineTriagePriority('patient is unconscious')).toBe('emergency')
  })
  test('returns emergency for stroke', () => {
    expect(determineTriagePriority('stroke symptoms sudden')).toBe('emergency')
  })
  test('returns emergency for severe bleeding', () => {
    expect(determineTriagePriority('severe bleeding from wound')).toBe('emergency')
  })
  test('is case insensitive', () => {
    expect(determineTriagePriority('CHEST PAIN severe')).toBe('emergency')
  })
})

describe('Triage Engine — Emergency Vitals', () => {
  test('returns emergency for SpO2 below 94', () => {
    expect(determineTriagePriority('breathing difficulty', undefined, undefined, undefined, 93)).toBe('emergency')
  })
  test('returns emergency for BP systolic above 180', () => {
    expect(determineTriagePriority('headache', undefined, 185, undefined, undefined)).toBe('emergency')
  })
  test('returns emergency for BP systolic below 90', () => {
    expect(determineTriagePriority('dizziness', undefined, 85, undefined, undefined)).toBe('emergency')
  })
  test('returns emergency for temperature above 104', () => {
    expect(determineTriagePriority('very high fever', 105, undefined, undefined, undefined)).toBe('emergency')
  })
})

describe('Triage Engine — Urgent Keywords', () => {
  test('returns urgent for fracture', () => {
    expect(determineTriagePriority('possible fracture in arm')).toBe('urgent')
  })
  test('returns urgent for migraine', () => {
    expect(determineTriagePriority('severe migraine')).toBe('urgent')
  })
  test('returns urgent for asthma attack', () => {
    expect(determineTriagePriority('asthma attack mild')).toBe('urgent')
  })
  test('returns urgent for burns', () => {
    expect(determineTriagePriority('burns on hand')).toBe('urgent')
  })
})

describe('Triage Engine — Urgent Vitals', () => {
  test('returns urgent for SpO2 94-96', () => {
    expect(determineTriagePriority('mild discomfort', undefined, undefined, undefined, 95)).toBe('urgent')
  })
  test('returns urgent for BP systolic 140-180', () => {
    expect(determineTriagePriority('headache', undefined, 155, undefined, undefined)).toBe('urgent')
  })
  test('returns urgent for temperature 102-104', () => {
    expect(determineTriagePriority('high fever', 103, undefined, undefined, undefined)).toBe('urgent')
  })
})

describe('Triage Engine — Normal', () => {
  test('returns normal for routine checkup', () => {
    expect(determineTriagePriority('routine checkup annual')).toBe('normal')
  })
  test('returns normal for all safe vitals', () => {
    expect(determineTriagePriority('mild cough', 98.6, 120, 80, 98)).toBe('normal')
  })
  test('returns normal for no symptoms no vitals', () => {
    expect(determineTriagePriority('general consultation')).toBe('normal')
  })
})
