// Database layer that uses Turso (libSQL) for serverless deployment
// This replaces the old JSON file-based database that didn't work on Vercel

import { put, del } from '@vercel/blob'
import { 
  getTursoClient, 
  tursoAgentsDb, 
  tursoDocumentsDb, 
  tursoInspectionsDb, 
  tursoAuditDb,
  initializeTursoDatabase 
} from './tursoDb'

// Re-export all database operations from Turso
export const agentsDb = tursoAgentsDb
export const documentsDb = tursoDocumentsDb
export const inspectionsDb = {
  ...tursoInspectionsDb,
  // Add countThisMonth method for dashboard stats
  countThisMonth: async (): Promise<number> => {
    const db = getTursoClient()
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const result = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM inspections WHERE created_at >= ?',
      args: [startOfMonth.toISOString()]
    })
    return (result.rows[0] as any).count || 0
  }
}

export const auditLogsDb = {
  findAll: () => tursoAuditDb.findAll(),
  create: (data: any) => tursoAuditDb.create(data),
  search: async (query: { entityType?: string; action?: string; limit?: number }) => {
    const db = getTursoClient()
    let sql = 'SELECT * FROM audit_logs WHERE 1=1'
    const args: any[] = []

    if (query.entityType) {
      sql += ' AND entity_type = ?'
      args.push(query.entityType)
    }

    if (query.action) {
      sql += ' AND action = ?'
      args.push(query.action)
    }

    sql += ' ORDER BY created_at DESC'

    if (query.limit) {
      sql += ' LIMIT ?'
      args.push(query.limit)
    }

    const result = await db.execute({ sql, args })
    // Parse metadata JSON string back to object
    return result.rows.map((row: any) => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : {}
    }))
  }
}

// Vercel Blob file storage for PDF documents
// Files are stored persistently in Vercel's blob storage
export const fileStorage = {
  async saveFile(fileName: string, agentId: string, buffer: Buffer): Promise<string> {
    const timestamp = Date.now()
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `documents/${agentId}/${timestamp}-${safeFileName}`
    
    // Upload to Vercel Blob
    const blob = await put(storagePath, buffer, {
      access: 'public',
      contentType: 'application/pdf'
    })
    
    // Return the blob URL as the storage path
    return blob.url
  },

  async deleteFile(storagePath: string): Promise<boolean> {
    try {
      // storagePath is actually the full blob URL
      await del(storagePath)
      return true
    } catch (error) {
      console.error('Failed to delete file from Vercel Blob:', error)
      return false
    }
  },

  getPublicUrl(storagePath: string): string {
    // storagePath is already the full public URL from Vercel Blob
    return storagePath
  }
}

// Initialize database (creates tables and seeds data if needed)
let initialized = false

export async function initializeDatabase(): Promise<void> {
  if (initialized) return
  
  try {
    await initializeTursoDatabase()
    initialized = true
    console.log('Turso database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Turso database:', error)
    throw error
  }
}
