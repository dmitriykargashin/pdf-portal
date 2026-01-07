export default defineEventHandler(async (event) => {
  await initializeDatabase()
  
  const session = await requireAuth(event)
  
  const docId = getRouterParam(event, 'id')
  
  if (!docId) {
    throw createError({
      statusCode: 400,
      message: 'Document ID is required'
    })
  }

  // Get document with agent check
  const doc = await documentsDb.findById(docId)

  if (!doc) {
    throw createError({
      statusCode: 404,
      message: 'Document not found'
    })
  }

  // Check agent access
  if (session.role === 'agent' && session.agentId !== doc.agent_id) {
    throw createError({
      statusCode: 403,
      message: 'You do not have access to this document'
    })
  }

  // Get public URL from local storage
  const url = fileStorage.getPublicUrl(doc.storage_path)

  return {
    url,
    document: {
      id: doc.id,
      agentId: doc.agent_id,
      title: doc.title,
      category: doc.category,
      fileName: doc.file_name,
      fileSize: doc.file_size,
      mimeType: doc.mime_type,
      createdAt: doc.created_at
    }
  }
})
