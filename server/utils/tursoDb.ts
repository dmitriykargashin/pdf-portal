import { createClient } from '@libsql/client'

// Create Turso client
const getClient = () => {
  const url = process.env.TURSO_DATABASE_URL || process.env.NUXT_TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN || process.env.NUXT_TURSO_AUTH_TOKEN

  if (!url || !authToken) {
    throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set')
  }

  return createClient({
    url,
    authToken
  })
}

// Lazy singleton client
let client: ReturnType<typeof createClient> | null = null

export const getTursoClient = () => {
  if (!client) {
    client = getClient()
  }
  return client
}

/**
 * Generate UUID
 */
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Agent operations
export const tursoAgentsDb = {
  async findAll(): Promise<any[]> {
    const db = getTursoClient()
    const result = await db.execute('SELECT * FROM agents ORDER BY created_at DESC')
    return result.rows as any[]
  },

  async findById(id: string): Promise<any | null> {
    const db = getTursoClient()
    const result = await db.execute({
      sql: 'SELECT * FROM agents WHERE id = ?',
      args: [id]
    })
    return result.rows[0] || null
  },

  async findByEmail(email: string): Promise<any | null> {
    const db = getTursoClient()
    const result = await db.execute({
      sql: 'SELECT * FROM agents WHERE LOWER(email) = LOWER(?)',
      args: [email]
    })
    return result.rows[0] || null
  },

  async create(data: any): Promise<any> {
    const db = getTursoClient()
    const id = generateId()
    const now = new Date().toISOString()

    await db.execute({
      sql: `INSERT INTO agents (id, full_name, email, phone, brokerage_name, license_number, address, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, data.full_name, data.email, data.phone, data.brokerage_name, data.license_number, data.address, data.status || 'active', now, now]
    })

    return this.findById(id)
  },

  async update(id: string, data: any): Promise<any | null> {
    const db = getTursoClient()
    const now = new Date().toISOString()

    const fields: string[] = []
    const args: any[] = []

    if (data.full_name !== undefined) { fields.push('full_name = ?'); args.push(data.full_name) }
    if (data.email !== undefined) { fields.push('email = ?'); args.push(data.email) }
    if (data.phone !== undefined) { fields.push('phone = ?'); args.push(data.phone) }
    if (data.brokerage_name !== undefined) { fields.push('brokerage_name = ?'); args.push(data.brokerage_name) }
    if (data.license_number !== undefined) { fields.push('license_number = ?'); args.push(data.license_number) }
    if (data.address !== undefined) { fields.push('address = ?'); args.push(data.address) }
    if (data.status !== undefined) { fields.push('status = ?'); args.push(data.status) }

    fields.push('updated_at = ?')
    args.push(now)
    args.push(id)

    await db.execute({
      sql: `UPDATE agents SET ${fields.join(', ')} WHERE id = ?`,
      args
    })

    return this.findById(id)
  },

  async delete(id: string): Promise<boolean> {
    const db = getTursoClient()
    const result = await db.execute({
      sql: 'DELETE FROM agents WHERE id = ?',
      args: [id]
    })
    return result.rowsAffected > 0
  },

  async search(query: { search?: string; status?: string }): Promise<any[]> {
    const db = getTursoClient()
    let sql = 'SELECT * FROM agents WHERE 1=1'
    const args: any[] = []

    if (query.search) {
      sql += ' AND (LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(brokerage_name) LIKE ?)'
      const searchTerm = `%${query.search.toLowerCase()}%`
      args.push(searchTerm, searchTerm, searchTerm)
    }

    if (query.status) {
      sql += ' AND status = ?'
      args.push(query.status)
    }

    sql += ' ORDER BY created_at DESC'

    const result = await db.execute({ sql, args })
    return result.rows as any[]
  }
}

// Document operations
export const tursoDocumentsDb = {
  async findAll(): Promise<any[]> {
    const db = getTursoClient()
    const result = await db.execute('SELECT * FROM documents ORDER BY created_at DESC')
    return result.rows as any[]
  },

  async findById(id: string): Promise<any | null> {
    const db = getTursoClient()
    const result = await db.execute({
      sql: 'SELECT * FROM documents WHERE id = ?',
      args: [id]
    })
    return result.rows[0] || null
  },

  async findByAgentId(agentId: string): Promise<any[]> {
    const db = getTursoClient()
    const result = await db.execute({
      sql: 'SELECT * FROM documents WHERE agent_id = ? ORDER BY created_at DESC',
      args: [agentId]
    })
    return result.rows as any[]
  },

  async findByInspectionId(inspectionId: string): Promise<any[]> {
    const db = getTursoClient()
    const result = await db.execute({
      sql: 'SELECT * FROM documents WHERE inspection_id = ? ORDER BY created_at DESC',
      args: [inspectionId]
    })
    return result.rows as any[]
  },

  async create(data: any): Promise<any> {
    const db = getTursoClient()
    const id = generateId()
    const now = new Date().toISOString()

    await db.execute({
      sql: `INSERT INTO documents (id, agent_id, inspection_id, title, category, file_name, file_size, mime_type, storage_path, uploaded_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, data.agent_id, data.inspection_id || null, data.title, data.category, data.file_name, data.file_size, data.mime_type, data.storage_path, data.uploaded_by, now]
    })

    return this.findById(id)
  },

  async delete(id: string): Promise<boolean> {
    const db = getTursoClient()
    const result = await db.execute({
      sql: 'DELETE FROM documents WHERE id = ?',
      args: [id]
    })
    return result.rowsAffected > 0
  },

  async search(query: { agentId?: string; inspectionId?: string; category?: string }): Promise<any[]> {
    const db = getTursoClient()
    let sql = 'SELECT * FROM documents WHERE 1=1'
    const args: any[] = []

    if (query.agentId) {
      sql += ' AND agent_id = ?'
      args.push(query.agentId)
    }

    if (query.inspectionId) {
      sql += ' AND inspection_id = ?'
      args.push(query.inspectionId)
    }

    if (query.category) {
      sql += ' AND category = ?'
      args.push(query.category)
    }

    sql += ' ORDER BY created_at DESC'

    const result = await db.execute({ sql, args })
    return result.rows as any[]
  }
}

// Inspection operations
export const tursoInspectionsDb = {
  async findAll(): Promise<any[]> {
    const db = getTursoClient()
    const result = await db.execute('SELECT * FROM inspections ORDER BY inspection_date DESC')
    return result.rows as any[]
  },

  async findById(id: string): Promise<any | null> {
    const db = getTursoClient()
    const result = await db.execute({
      sql: 'SELECT * FROM inspections WHERE id = ?',
      args: [id]
    })
    return result.rows[0] || null
  },

  async findByAgentId(agentId: string): Promise<any[]> {
    const db = getTursoClient()
    const result = await db.execute({
      sql: 'SELECT * FROM inspections WHERE agent_id = ? ORDER BY inspection_date DESC',
      args: [agentId]
    })
    return result.rows as any[]
  },

  async create(data: any): Promise<any> {
    const db = getTursoClient()
    const id = generateId()
    const now = new Date().toISOString()

    await db.execute({
      sql: `INSERT INTO inspections (id, agent_id, inspection_date, property_address, status, inspector_name, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, data.agent_id, data.inspection_date, data.property_address, data.status || 'scheduled', data.inspector_name, data.notes || null, now]
    })

    return this.findById(id)
  },

  async update(id: string, data: any): Promise<any | null> {
    const db = getTursoClient()
    const fields: string[] = []
    const args: any[] = []

    if (data.inspection_date !== undefined) { fields.push('inspection_date = ?'); args.push(data.inspection_date) }
    if (data.property_address !== undefined) { fields.push('property_address = ?'); args.push(data.property_address) }
    if (data.status !== undefined) { fields.push('status = ?'); args.push(data.status) }
    if (data.inspector_name !== undefined) { fields.push('inspector_name = ?'); args.push(data.inspector_name) }
    if (data.notes !== undefined) { fields.push('notes = ?'); args.push(data.notes) }

    if (fields.length === 0) return this.findById(id)

    args.push(id)

    await db.execute({
      sql: `UPDATE inspections SET ${fields.join(', ')} WHERE id = ?`,
      args
    })

    return this.findById(id)
  },

  async delete(id: string): Promise<boolean> {
    const db = getTursoClient()
    const result = await db.execute({
      sql: 'DELETE FROM inspections WHERE id = ?',
      args: [id]
    })
    return result.rowsAffected > 0
  },

  async search(query: { agentId?: string; status?: string }): Promise<any[]> {
    const db = getTursoClient()
    let sql = 'SELECT * FROM inspections WHERE 1=1'
    const args: any[] = []

    if (query.agentId) {
      sql += ' AND agent_id = ?'
      args.push(query.agentId)
    }

    if (query.status) {
      sql += ' AND status = ?'
      args.push(query.status)
    }

    sql += ' ORDER BY inspection_date DESC'

    const result = await db.execute({ sql, args })
    return result.rows as any[]
  }
}

// Audit log operations
export const tursoAuditDb = {
  async findAll(limit: number = 100): Promise<any[]> {
    const db = getTursoClient()
    const result = await db.execute({
      sql: 'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?',
      args: [limit]
    })
    return result.rows as any[]
  },

  async create(data: any): Promise<any> {
    const db = getTursoClient()
    const id = generateId()
    const now = new Date().toISOString()

    await db.execute({
      sql: `INSERT INTO audit_logs (id, actor_id, actor_role, action, entity_type, entity_id, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, data.actor_id || null, data.actor_role, data.action, data.entity_type, data.entity_id || null, JSON.stringify(data.metadata || {}), now]
    })

    return { id, ...data, created_at: now }
  }
}

// Initialize database schema
export async function initializeTursoDatabase(): Promise<void> {
  const db = getTursoClient()

  // Create tables if they don't exist
  await db.execute(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      brokerage_name TEXT,
      license_number TEXT,
      address TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS inspections (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      inspection_date TEXT NOT NULL,
      property_address TEXT NOT NULL,
      status TEXT DEFAULT 'scheduled',
      inspector_name TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      inspection_id TEXT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      uploaded_by TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
      FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE SET NULL
    )
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_id TEXT,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL
    )
  `)

  // Check if we need to seed data
  const agentsResult = await db.execute('SELECT COUNT(*) as count FROM agents')
  const agentCount = (agentsResult.rows[0] as any).count

  if (agentCount === 0) {
    console.log('Seeding Turso database with initial data...')
    
    // Seed agents
    const agents = [
      { id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', full_name: 'Sarah Johnson', email: 'sarah.johnson@realty.com', phone: '(555) 123-4567', brokerage_name: 'Premier Realty Group', license_number: 'RE-2024-001', address: '123 Main Street, Suite 100, New York, NY 10001', status: 'active' },
      { id: 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', full_name: 'Michael Chen', email: 'michael.chen@homefinders.com', phone: '(555) 234-5678', brokerage_name: 'HomeFinders Inc.', license_number: 'RE-2024-002', address: '456 Oak Avenue, Los Angeles, CA 90001', status: 'active' },
      { id: 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', full_name: 'Emily Rodriguez', email: 'emily.rodriguez@luxuryhomes.com', phone: '(555) 345-6789', brokerage_name: 'Luxury Homes International', license_number: 'RE-2024-003', address: '789 Palm Drive, Miami, FL 33101', status: 'active' },
      { id: 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', full_name: 'David Thompson', email: 'david.thompson@cityproperties.com', phone: '(555) 456-7890', brokerage_name: 'City Properties LLC', license_number: 'RE-2024-004', address: '321 Urban Way, Chicago, IL 60601', status: 'active' },
      { id: 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', full_name: 'Jennifer Williams', email: 'jennifer.williams@coastalrealty.com', phone: '(555) 567-8901', brokerage_name: 'Coastal Realty Partners', license_number: 'RE-2024-005', address: '654 Beach Boulevard, San Diego, CA 92101', status: 'inactive' }
    ]

    const now = new Date().toISOString()
    for (const agent of agents) {
      await db.execute({
        sql: `INSERT INTO agents (id, full_name, email, phone, brokerage_name, license_number, address, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [agent.id, agent.full_name, agent.email, agent.phone, agent.brokerage_name, agent.license_number, agent.address, agent.status, now, now]
      })
    }

    // Seed inspections
    const inspections = [
      { id: 'i1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c', agent_id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', inspection_date: '2026-01-15', property_address: '100 Park Avenue, Apt 5A, New York, NY 10017', status: 'scheduled', inspector_name: 'Robert Martinez', notes: 'Pre-purchase inspection for luxury condo' },
      { id: 'i2b3c4d5-e6f7-5a8b-9c0d-1e2f3a4b5c6d', agent_id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', inspection_date: '2025-12-20', property_address: '250 West 57th Street, Unit 12B, New York, NY 10019', status: 'completed', inspector_name: 'Lisa Anderson', notes: 'Inspection completed. Minor repairs needed.' },
      { id: 'i7a8b9c0-d1e2-0f3a-4b5c-6d7e8f9a0b1c', agent_id: 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', inspection_date: '2026-02-01', property_address: '333 North Michigan Avenue, Chicago, IL 60601', status: 'scheduled', inspector_name: 'Thomas Wright', notes: 'Commercial property inspection' },
      { id: 'i8b9c0d1-e2f3-1a4b-5c6d-7e8f9a0b1c2d', agent_id: 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', inspection_date: '2025-12-10', property_address: '1000 Lake Shore Drive, Chicago, IL 60611', status: 'completed', inspector_name: 'Patricia Lee', notes: 'Lakefront condo - HVAC needs service' }
    ]

    for (const insp of inspections) {
      await db.execute({
        sql: `INSERT INTO inspections (id, agent_id, inspection_date, property_address, status, inspector_name, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [insp.id, insp.agent_id, insp.inspection_date, insp.property_address, insp.status, insp.inspector_name, insp.notes, now]
      })
    }

    console.log('Turso database seeded successfully')
  }
}
