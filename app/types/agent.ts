// Agent type definition
export interface Agent {
  id: string
  fullName: string
  email: string
  phone: string
  brokerageName: string
  licenseNumber?: string
  address?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface AgentCreateInput {
  fullName: string
  email: string
  phone: string
  brokerageName: string
  licenseNumber?: string
  address?: string
  status?: 'active' | 'inactive'
}

export interface AgentUpdateInput extends Partial<AgentCreateInput> {
  id: string
}
