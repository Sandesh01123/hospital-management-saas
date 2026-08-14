import { Request, Response, NextFunction } from 'express'

/**
 * Tenant middleware for multi-hospital support
 * 
 * Reads the X-Tenant-ID header from the request and sets req.tenantId.
 * If the header is missing, defaults to null (single-tenant mode).
 * This provides backward compatibility while enabling multi-tenant architecture.
 * 
 * Usage:
 * Apply this middleware to routes that need tenant isolation.
 * Controllers should use req.tenantId to filter queries by tenant_id.
 */

declare global {
  namespace Express {
    interface Request {
      tenantId?: string | null
    }
  }
}

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Read tenant ID from header
  const tenantId = req.headers['x-tenant-id'] as string | undefined

  // Set tenant ID on request object
  // If not provided, defaults to null (single-tenant mode)
  req.tenantId = tenantId || null

  next()
}
