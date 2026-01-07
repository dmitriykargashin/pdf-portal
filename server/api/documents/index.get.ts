import type { Document } from '~/types'

export default defineEventHandler(async (event) => {
  await initializeDatabase()
  
  const session = await requireAuth(event)
  
  const query = getQuery(event)
  const agentId = query.agentId as string | undefined
  const inspectionId = query.inspectionId as string | undefined
  const category = query.category as string | undefined

  // If agent, only return their own documents
  const effectiveAgentId = session.role === 'agent' ? session.agentId : agentId

  if (!effectiveAgentId && !inspectionId && session.role === 'agent') {
    throw createError({
      statusCode: 400,
      message: 'Agent ID or Inspection ID is required'
    })
  }

  const data = await documentsDb.search({ 
    agentId: effectiveAgentId, 
    inspectionId,
    category 
  })

  const documents: Document[] = data.map(row => ({
    id: row.id,
    agentId: row.agent_id,
    inspectionId: row.inspection_id,
    title: row.title,
    category: row.category,
    fileName: row.file_name,
    fileSize: row.file_size,
    mimeType: row.mime_type,
    storagePath: row.storage_path,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at
  }))

  return { documents }
})
