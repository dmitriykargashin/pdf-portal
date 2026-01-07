import type { DocumentCategory } from '~/types'

export default defineEventHandler(async (event) => {
  await initializeDatabase()
  
  // Only admins can upload documents
  await requireRole(event, ['admin'])

  const formData = await readMultipartFormData(event)
  
  if (!formData) {
    throw createError({
      statusCode: 400,
      message: 'No form data received'
    })
  }

  // Extract form fields
  let agentId = ''
  let inspectionId = ''
  let title = ''
  let category: DocumentCategory = 'Other'
  let file: { data: Buffer; filename: string; type: string } | null = null

  for (const item of formData) {
    if (item.name === 'agentId' && item.data) {
      agentId = item.data.toString()
    } else if (item.name === 'inspectionId' && item.data) {
      inspectionId = item.data.toString()
    } else if (item.name === 'title' && item.data) {
      title = item.data.toString()
    } else if (item.name === 'category' && item.data) {
      category = item.data.toString() as DocumentCategory
    } else if (item.name === 'file' && item.data && item.filename) {
      file = {
        data: item.data,
        filename: item.filename,
        type: item.type || 'application/pdf'
      }
    }
  }

  // Validate required fields
  if (!agentId || !title || !file) {
    throw createError({
      statusCode: 400,
      message: 'Agent ID, title, and file are required'
    })
  }

  // Upload to public folder storage
  const storagePath = await fileStorage.saveFile(file.filename, agentId, file.data)

  // Create document record in JSON database
  const data = await documentsDb.create({
    agent_id: agentId,
    inspection_id: inspectionId || undefined,
    title,
    category,
    file_name: file.filename,
    file_size: file.data.length,
    mime_type: file.type,
    storage_path: storagePath,
    uploaded_by: 'admin'
  })

  await auditLog(event, 'UPLOAD_DOC', 'document', data.id, {
    agentId,
    inspectionId: inspectionId || undefined,
    title,
    category,
    fileName: file.filename,
    fileSize: file.data.length
  })

  return {
    document: {
      id: data.id,
      agentId: data.agent_id,
      inspectionId: data.inspection_id,
      title: data.title,
      category: data.category,
      fileName: data.file_name,
      fileSize: data.file_size,
      mimeType: data.mime_type,
      storagePath: data.storage_path,
      uploadedBy: data.uploaded_by,
      createdAt: data.created_at
    }
  }
})
