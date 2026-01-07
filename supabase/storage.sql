-- Create Supabase Storage bucket for documents
-- Run this in the Supabase Dashboard SQL Editor or use the Storage API

-- Note: Storage bucket creation is typically done through the Supabase Dashboard
-- or using the Supabase JavaScript client. This file documents the configuration.

/*
Storage Bucket Configuration:
- Bucket Name: documents
- Public: false (private bucket)
- File size limit: 52428800 (50MB)
- Allowed MIME types: application/pdf

To create via Dashboard:
1. Go to Storage in your Supabase project
2. Click "New bucket"
3. Name: documents
4. Public bucket: OFF (unchecked)
5. Click "Create bucket"

To set up policies (for service role access):
The service role key bypasses RLS, so no additional policies needed
for server-side operations.
*/

-- If using SQL to create bucket (Supabase >= v2):
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents', 
  false,
  52428800,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;
