import type { H3Event } from 'h3'

const ALLOWED_MIME_TYPES = ['application/pdf']
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

/**
 * Generate a unique storage path for a document
 */
export function generateStoragePath(agentId: string, fileName: string): string {
  const timestamp = Date.now()
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `agents/${agentId}/${timestamp}-${sanitizedFileName}`
}

/**
 * Validate uploaded file
 */
export function validateFile(
  file: { type: string; size: number; name: string }
): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Only PDF files are allowed'
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`
    }
  }

  return { valid: true }
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadToStorage(
  storagePath: string,
  file: Buffer | Uint8Array,
  contentType: string
): Promise<{ path: string; error?: string }> {
  const supabase = useSupabaseAdmin()
  
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(storagePath, file, {
      contentType,
      upsert: false
    })

  if (error) {
    console.error('Storage upload error:', error)
    return { path: '', error: error.message }
  }

  return { path: data.path }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFromStorage(storagePath: string): Promise<boolean> {
  const supabase = useSupabaseAdmin()
  
  const { error } = await supabase.storage
    .from('documents')
    .remove([storagePath])

  if (error) {
    console.error('Storage delete error:', error)
    return false
  }

  return true
}

/**
 * Generate signed URL for file access
 */
export async function getSignedUrl(
  storagePath: string,
  expiresIn: number = 60 // seconds
): Promise<{ url: string; error?: string }> {
  const supabase = useSupabaseAdmin()
  
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(storagePath, expiresIn)

  if (error) {
    console.error('Signed URL error:', error)
    return { url: '', error: error.message }
  }

  return { url: data.signedUrl }
}

// TODO: Placeholder for malware scan integration
export async function scanForMalware(file: Buffer): Promise<{ safe: boolean; threat?: string }> {
  // In production, integrate with a malware scanning service
  // For prototype, always return safe
  console.log('TODO: Implement malware scanning')
  return { safe: true }
}
