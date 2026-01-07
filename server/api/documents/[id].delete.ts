export default defineEventHandler(async (event) => {
  await initializeDatabase()
  
  // Only admins can delete documents
  await requireRole(event, ['admin'])

  const docId = getRouterParam(event, 'id')
  
  if (!docId) {
    throw createError({
      statusCode: 400,
      message: 'Document ID is required'
    })
  }

  // Get document info first
  const doc = await documentsDb.findById(docId)

  if (!doc) {
    throw createError({
      statusCode: 404,
      message: 'Document not found'
    })
  }

  // Delete from file storage
  await fileStorage.deleteFile(doc.storage_path)

  // Delete from database
  const deleted = await documentsDb.delete(docId)

  if (!deleted) {
    throw createError({
      statusCode: 500,
      message: 'Failed to delete document'
    })
  }

  await auditLog(event, 'DELETE_DOC', 'document', docId, {
    agentId: doc.agent_id,
    title: doc.title,
    fileName: doc.file_name
  })

  return { success: true }
})
