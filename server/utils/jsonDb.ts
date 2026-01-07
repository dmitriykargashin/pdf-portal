import { promises as fs } from 'fs'
import { join } from 'path'

// Base path for JSON database files
const getDbPath = () => {
  // In development, use the public folder directly
  // In production, this would need to be adjusted
  return join(process.cwd(), 'public', 'db')
}

const getUploadsPath = () => {
  return join(process.cwd(), 'public', 'uploads')
}

/**
 * Ensure directory exists
 */
async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
  }
}

/**
 * Read JSON file
 */
async function readJsonFile<T>(filename: string): Promise<T[]> {
  const filePath = join(getDbPath(), filename)
  try {
    await ensureDir(getDbPath())
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []
    }
    throw error
  }
}

/**
 * Write JSON file
 */
async function writeJsonFile<T>(filename: string, data: T[]): Promise<void> {
  const filePath = join(getDbPath(), filename)
  await ensureDir(getDbPath())
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
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

// Database collections
const COLLECTIONS = {
  agents: 'agents.json',
  documents: 'documents.json',
  inspections: 'inspections.json',
  auditLogs: 'audit_logs.json'
}

// Agent operations
export const agentsDb = {
  async findAll(): Promise<any[]> {
    return readJsonFile(COLLECTIONS.agents)
  },
  
  async findById(id: string): Promise<any | null> {
    const agents = await this.findAll()
    return agents.find(a => a.id === id) || null
  },
  
  async findByEmail(email: string): Promise<any | null> {
    const agents = await this.findAll()
    const emailLower = email.toLowerCase()
    return agents.find(a => a.email?.toLowerCase() === emailLower) || null
  },
  
  async create(data: any): Promise<any> {
    const agents = await this.findAll()
    const newAgent = {
      id: generateId(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    agents.push(newAgent)
    await writeJsonFile(COLLECTIONS.agents, agents)
    return newAgent
  },
  
  async update(id: string, data: any): Promise<any | null> {
    const agents = await this.findAll()
    const index = agents.findIndex(a => a.id === id)
    if (index === -1) return null
    
    agents[index] = {
      ...agents[index],
      ...data,
      updated_at: new Date().toISOString()
    }
    await writeJsonFile(COLLECTIONS.agents, agents)
    return agents[index]
  },
  
  async delete(id: string): Promise<boolean> {
    const agents = await this.findAll()
    const filtered = agents.filter(a => a.id !== id)
    if (filtered.length === agents.length) return false
    await writeJsonFile(COLLECTIONS.agents, filtered)
    return true
  },
  
  async search(query: { search?: string; status?: string }): Promise<any[]> {
    let agents = await this.findAll()
    
    if (query.search) {
      const searchLower = query.search.toLowerCase()
      agents = agents.filter(a => 
        a.full_name?.toLowerCase().includes(searchLower) ||
        a.email?.toLowerCase().includes(searchLower) ||
        a.brokerage_name?.toLowerCase().includes(searchLower)
      )
    }
    
    if (query.status) {
      agents = agents.filter(a => a.status === query.status)
    }
    
    return agents.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }
}

// Document operations
export const documentsDb = {
  async findAll(): Promise<any[]> {
    return readJsonFile(COLLECTIONS.documents)
  },
  
  async findById(id: string): Promise<any | null> {
    const docs = await this.findAll()
    return docs.find(d => d.id === id) || null
  },
  
  async findByAgentId(agentId: string): Promise<any[]> {
    const docs = await this.findAll()
    return docs.filter(d => d.agent_id === agentId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  },
  
  async create(data: any): Promise<any> {
    const docs = await this.findAll()
    const newDoc = {
      id: generateId(),
      ...data,
      created_at: new Date().toISOString()
    }
    docs.push(newDoc)
    await writeJsonFile(COLLECTIONS.documents, docs)
    return newDoc
  },
  
  async delete(id: string): Promise<boolean> {
    const docs = await this.findAll()
    const filtered = docs.filter(d => d.id !== id)
    if (filtered.length === docs.length) return false
    await writeJsonFile(COLLECTIONS.documents, filtered)
    return true
  },
  
  async search(query: { agentId?: string; inspectionId?: string; category?: string }): Promise<any[]> {
    let docs = await this.findAll()
    
    if (query.agentId) {
      docs = docs.filter(d => d.agent_id === query.agentId)
    }
    
    if (query.inspectionId) {
      docs = docs.filter(d => d.inspection_id === query.inspectionId)
    }
    
    if (query.category) {
      docs = docs.filter(d => d.category === query.category)
    }
    
    return docs.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  },
  
  async findByInspectionId(inspectionId: string): Promise<any[]> {
    const docs = await this.findAll()
    return docs.filter(d => d.inspection_id === inspectionId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
}

// Inspection operations
export const inspectionsDb = {
  async findAll(): Promise<any[]> {
    return readJsonFile(COLLECTIONS.inspections)
  },
  
  async findById(id: string): Promise<any | null> {
    const inspections = await this.findAll()
    return inspections.find(i => i.id === id) || null
  },
  
  async findByAgentId(agentId: string): Promise<any[]> {
    const inspections = await this.findAll()
    return inspections.filter(i => i.agent_id === agentId)
      .sort((a, b) => new Date(b.inspection_date).getTime() - new Date(a.inspection_date).getTime())
  },
  
  async create(data: any): Promise<any> {
    const inspections = await this.findAll()
    const newInspection = {
      id: generateId(),
      ...data,
      created_at: new Date().toISOString()
    }
    inspections.push(newInspection)
    await writeJsonFile(COLLECTIONS.inspections, inspections)
    return newInspection
  },
  
  async update(id: string, data: any): Promise<any | null> {
    const inspections = await this.findAll()
    const index = inspections.findIndex(i => i.id === id)
    if (index === -1) return null
    
    inspections[index] = {
      ...inspections[index],
      ...data
    }
    await writeJsonFile(COLLECTIONS.inspections, inspections)
    return inspections[index]
  },
  
  async search(query: { agentId?: string; status?: string }): Promise<any[]> {
    let inspections = await this.findAll()
    
    if (query.agentId) {
      inspections = inspections.filter(i => i.agent_id === query.agentId)
    }
    
    if (query.status) {
      inspections = inspections.filter(i => i.status === query.status)
    }
    
    return inspections.sort((a, b) => 
      new Date(b.inspection_date).getTime() - new Date(a.inspection_date).getTime()
    )
  },
  
  async countThisMonth(): Promise<number> {
    const inspections = await this.findAll()
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    return inspections.filter(i => 
      new Date(i.created_at) >= startOfMonth
    ).length
  }
}

// Audit log operations
export const auditLogsDb = {
  async findAll(): Promise<any[]> {
    return readJsonFile(COLLECTIONS.auditLogs)
  },
  
  async create(data: any): Promise<any> {
    const logs = await this.findAll()
    const newLog = {
      id: generateId(),
      ...data,
      created_at: new Date().toISOString()
    }
    logs.push(newLog)
    await writeJsonFile(COLLECTIONS.auditLogs, logs)
    return newLog
  },
  
  async search(query: { entityType?: string; action?: string; limit?: number }): Promise<any[]> {
    let logs = await this.findAll()
    
    if (query.entityType) {
      logs = logs.filter(l => l.entity_type === query.entityType)
    }
    
    if (query.action) {
      logs = logs.filter(l => l.action === query.action)
    }
    
    logs = logs.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    
    if (query.limit) {
      logs = logs.slice(0, query.limit)
    }
    
    return logs
  }
}

// File storage operations
export const fileStorage = {
  async saveFile(fileName: string, agentId: string, buffer: Buffer): Promise<string> {
    const uploadsDir = getUploadsPath()
    const agentDir = join(uploadsDir, agentId)
    await ensureDir(agentDir)
    
    const timestamp = Date.now()
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `${agentId}/${timestamp}-${safeFileName}`
    const fullPath = join(uploadsDir, storagePath)
    
    await fs.writeFile(fullPath, buffer)
    return storagePath
  },
  
  async deleteFile(storagePath: string): Promise<boolean> {
    try {
      const fullPath = join(getUploadsPath(), storagePath)
      await fs.unlink(fullPath)
      return true
    } catch {
      return false
    }
  },
  
  getPublicUrl(storagePath: string): string {
    // Return URL relative to public folder
    return `/uploads/${storagePath}`
  }
}

// Initialize database with seed data if empty
export async function initializeDatabase(): Promise<void> {
  await ensureDir(getDbPath())
  await ensureDir(getUploadsPath())
  
  const agents = await agentsDb.findAll()
  if (agents.length === 0) {
    // Seed with sample data
    const sampleAgents = [
      {
        id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
        full_name: 'Sarah Johnson',
        email: 'sarah.johnson@realty.com',
        phone: '(555) 123-4567',
        brokerage_name: 'Premier Realty Group',
        license_number: 'RE-2024-001',
        address: '123 Main Street, Suite 100, New York, NY 10001',
        status: 'active',
        created_at: '2025-06-15T10:00:00Z',
        updated_at: '2025-06-15T10:00:00Z'
      },
      {
        id: 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
        full_name: 'Michael Chen',
        email: 'michael.chen@homefinders.com',
        phone: '(555) 234-5678',
        brokerage_name: 'HomeFinders Inc.',
        license_number: 'RE-2024-002',
        address: '456 Oak Avenue, Los Angeles, CA 90001',
        status: 'active',
        created_at: '2025-07-20T14:30:00Z',
        updated_at: '2025-07-20T14:30:00Z'
      },
      {
        id: 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
        full_name: 'Emily Rodriguez',
        email: 'emily.rodriguez@luxuryhomes.com',
        phone: '(555) 345-6789',
        brokerage_name: 'Luxury Homes International',
        license_number: 'RE-2024-003',
        address: '789 Palm Drive, Miami, FL 33101',
        status: 'active',
        created_at: '2025-08-10T09:15:00Z',
        updated_at: '2025-08-10T09:15:00Z'
      },
      {
        id: 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a',
        full_name: 'David Thompson',
        email: 'david.thompson@cityproperties.com',
        phone: '(555) 456-7890',
        brokerage_name: 'City Properties LLC',
        license_number: 'RE-2024-004',
        address: '321 Urban Way, Chicago, IL 60601',
        status: 'active',
        created_at: '2025-09-05T11:45:00Z',
        updated_at: '2025-09-05T11:45:00Z'
      },
      {
        id: 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b',
        full_name: 'Jennifer Williams',
        email: 'jennifer.williams@coastalrealty.com',
        phone: '(555) 567-8901',
        brokerage_name: 'Coastal Realty Partners',
        license_number: 'RE-2024-005',
        address: '654 Beach Boulevard, San Diego, CA 92101',
        status: 'inactive',
        created_at: '2025-10-01T16:20:00Z',
        updated_at: '2025-10-01T16:20:00Z'
      }
    ]
    
    await writeJsonFile(COLLECTIONS.agents, sampleAgents)
    
    // Seed inspections
    const sampleInspections = [
      {
        id: 'i1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
        agent_id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
        inspection_date: '2026-01-15',
        property_address: '100 Park Avenue, Apt 5A, New York, NY 10017',
        status: 'scheduled',
        inspector_name: 'Robert Martinez',
        notes: 'Pre-purchase inspection for luxury condo',
        created_at: '2026-01-05T10:00:00Z'
      },
      {
        id: 'i2b3c4d5-e6f7-5a8b-9c0d-1e2f3a4b5c6d',
        agent_id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
        inspection_date: '2025-12-20',
        property_address: '250 West 57th Street, Unit 12B, New York, NY 10019',
        status: 'completed',
        inspector_name: 'Lisa Anderson',
        notes: 'Inspection completed. Minor repairs needed.',
        created_at: '2025-12-10T14:30:00Z'
      },
      {
        id: 'i3c4d5e6-f7a8-6b9c-0d1e-2f3a4b5c6d7e',
        agent_id: 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
        inspection_date: '2026-01-20',
        property_address: '1234 Sunset Boulevard, Los Angeles, CA 90028',
        status: 'scheduled',
        inspector_name: 'Maria Garcia',
        notes: 'New construction final inspection',
        created_at: '2026-01-02T09:00:00Z'
      },
      {
        id: 'i4d5e6f7-a8b9-7c0d-1e2f-3a4b5c6d7e8f',
        agent_id: 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
        inspection_date: '2025-12-15',
        property_address: '5678 Hollywood Hills Drive, Los Angeles, CA 90068',
        status: 'completed',
        inspector_name: 'Kevin Brown',
        notes: 'Pool and spa inspection included',
        created_at: '2025-12-01T11:00:00Z'
      },
      {
        id: 'i5e6f7a8-b9c0-8d1e-2f3a-4b5c6d7e8f9a',
        agent_id: 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
        inspection_date: '2026-01-25',
        property_address: '900 Brickell Bay Drive, Miami, FL 33131',
        status: 'scheduled',
        inspector_name: 'Carlos Hernandez',
        notes: 'Waterfront property - hurricane shutters inspection',
        created_at: '2026-01-03T15:00:00Z'
      },
      {
        id: 'i6f7a8b9-c0d1-9e2f-3a4b-5c6d7e8f9a0b',
        agent_id: 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
        inspection_date: '2025-12-28',
        property_address: '1500 Ocean Drive, Miami Beach, FL 33139',
        status: 'completed',
        inspector_name: 'Ana Santos',
        notes: 'Excellent condition. Ready for closing.',
        created_at: '2025-12-18T10:30:00Z'
      },
      {
        id: 'i7a8b9c0-d1e2-0f3a-4b5c-6d7e8f9a0b1c',
        agent_id: 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a',
        inspection_date: '2026-02-01',
        property_address: '333 North Michigan Avenue, Chicago, IL 60601',
        status: 'scheduled',
        inspector_name: 'Thomas Wright',
        notes: 'Commercial property inspection',
        created_at: '2026-01-06T08:00:00Z'
      },
      {
        id: 'i8b9c0d1-e2f3-1a4b-5c6d-7e8f9a0b1c2d',
        agent_id: 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a',
        inspection_date: '2025-12-10',
        property_address: '1000 Lake Shore Drive, Chicago, IL 60611',
        status: 'completed',
        inspector_name: 'Patricia Lee',
        notes: 'Lakefront condo - HVAC needs service',
        created_at: '2025-11-28T13:00:00Z'
      },
      {
        id: 'i9c0d1e2-f3a4-2b5c-6d7e-8f9a0b1c2d3e',
        agent_id: 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
        inspection_date: '2025-10-05',
        property_address: '2200 Collins Avenue, Miami Beach, FL 33140',
        status: 'canceled',
        inspector_name: 'Carlos Hernandez',
        notes: 'Buyer withdrew offer',
        created_at: '2025-09-25T09:00:00Z'
      }
    ]
    
    await writeJsonFile(COLLECTIONS.inspections, sampleInspections)
    
    // Seed audit logs
    const sampleAuditLogs = [
      { id: 'al1', actor_role: 'admin', action: 'CREATE_AGENT', entity_type: 'agent', metadata: { agentName: 'Sarah Johnson' }, created_at: '2025-06-15T10:00:00Z' },
      { id: 'al2', actor_role: 'admin', action: 'CREATE_AGENT', entity_type: 'agent', metadata: { agentName: 'Michael Chen' }, created_at: '2025-07-20T14:30:00Z' },
      { id: 'al3', actor_role: 'admin', action: 'CREATE_AGENT', entity_type: 'agent', metadata: { agentName: 'Emily Rodriguez' }, created_at: '2025-08-10T09:15:00Z' },
      { id: 'al4', actor_role: 'admin', action: 'CREATE_INSPECTION', entity_type: 'inspection', metadata: { propertyAddress: '100 Park Avenue' }, created_at: '2026-01-05T10:00:00Z' },
      { id: 'al5', actor_role: 'admin', action: 'CREATE_INSPECTION', entity_type: 'inspection', metadata: { propertyAddress: '1234 Sunset Boulevard' }, created_at: '2026-01-02T09:00:00Z' }
    ]
    
    await writeJsonFile(COLLECTIONS.auditLogs, sampleAuditLogs)
    
    // Initialize empty documents
    await writeJsonFile(COLLECTIONS.documents, [])
    
    console.log('Database initialized with seed data')
  }
}
