import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabaseClient'

export function auditLogger(action: string, tableName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (supabase) {
        await supabase.from('audit_logs').insert({
          action,
          table_name: tableName,
          ip_address: req.ip || '',
          user_agent: req.get('user-agent') || '',
          request_body: JSON.stringify(req.body || {}).substring(0, 2000),
          created_at: new Date().toISOString()
        })
      }
    } catch (e: any) {
      console.warn('Audit log failed (non-blocking):', e.message)
    }
    next()
  }
}
