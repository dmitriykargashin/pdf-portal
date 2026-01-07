<script setup lang="ts">
import type { Agent, InspectionWithAgent, InspectionStatus, Document, DocumentCategory } from '~/types'
import { INSPECTION_STATUSES } from '~/types/inspection'
import { DOCUMENT_CATEGORIES } from '~/types/document'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const inspectionId = route.params.id as string

const { fetchInspection, updateInspection, loading } = useInspections()
const { agents, fetchAgents } = useAgents()
const { documents, fetchDocuments, uploadDocument, deleteDocument, getDocumentUrl, formatFileSize, loading: docsLoading } = useDocuments()

const inspection = ref<InspectionWithAgent | null>(null)
const isEditing = ref(false)
const editForm = ref({
  inspectionDate: '',
  propertyAddress: '',
  inspectorName: '',
  status: 'scheduled' as InspectionStatus,
  notes: ''
})

// Upload modal
const showUploadModal = ref(false)
const uploadForm = ref({
  title: '',
  category: 'InspectionReport' as DocumentCategory,
  file: null as File | null
})
const uploading = ref(false)

// Delete document modal
const showDeleteDocModal = ref(false)
const docToDelete = ref<Document | null>(null)

// PDF Viewer
const showPdfViewer = ref(false)
const pdfUrl = ref('')
const viewingDoc = ref<Document | null>(null)

// Fetch data
onMounted(async () => {
  const data = await fetchInspection(inspectionId)
  if (data) {
    inspection.value = data as InspectionWithAgent
    editForm.value = {
      inspectionDate: data.inspectionDate,
      propertyAddress: data.propertyAddress,
      inspectorName: data.inspectorName,
      status: data.status,
      notes: data.notes || ''
    }
    
    // Fetch documents for this inspection
    await fetchDocuments({ inspectionId })
  }
  await fetchAgents()
  
  // Check if edit mode requested via query param
  if (route.query.edit === 'true') {
    isEditing.value = true
  }
})

const selectedAgent = computed(() => {
  if (!inspection.value) return null
  return agents.value.find(a => a.id === inspection.value?.agentId) || null
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusColor = (status: InspectionStatus) => {
  switch (status) {
    case 'scheduled': return 'info'
    case 'completed': return 'success'
    case 'canceled': return 'error'
    default: return 'neutral'
  }
}

const startEditing = () => {
  if (inspection.value) {
    editForm.value = {
      inspectionDate: inspection.value.inspectionDate,
      propertyAddress: inspection.value.propertyAddress,
      inspectorName: inspection.value.inspectorName,
      status: inspection.value.status,
      notes: inspection.value.notes || ''
    }
  }
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
}

const handleSave = async () => {
  if (!editForm.value.inspectionDate || !editForm.value.propertyAddress || !editForm.value.inspectorName) {
    toast.add({
      title: 'Error',
      description: 'Please fill in all required fields',
      color: 'error'
    })
    return
  }
  
  const updated = await updateInspection(inspectionId, editForm.value)
  
  if (updated) {
    inspection.value = { ...inspection.value, ...updated } as InspectionWithAgent
    isEditing.value = false
    toast.add({
      title: 'Success',
      description: 'Inspection updated successfully',
      color: 'success'
    })
  } else {
    toast.add({
      title: 'Error',
      description: 'Failed to update inspection',
      color: 'error'
    })
  }
}

// Document functions
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    uploadForm.value.file = input.files[0]
  }
}

const handleUpload = async () => {
  if (!uploadForm.value.file || !uploadForm.value.title || !inspection.value) {
    toast.add({
      title: 'Error',
      description: 'Please fill in all required fields',
      color: 'error'
    })
    return
  }
  
  uploading.value = true
  
  try {
    const doc = await uploadDocument({
      agentId: inspection.value.agentId,
      inspectionId: inspectionId,
      title: uploadForm.value.title,
      category: uploadForm.value.category,
      file: uploadForm.value.file
    })
    
    if (doc) {
      toast.add({
        title: 'Success',
        description: 'Document uploaded successfully',
        color: 'success'
      })
      showUploadModal.value = false
      uploadForm.value = { title: '', category: 'InspectionReport', file: null }
      // Refresh documents
      await fetchDocuments({ inspectionId })
    }
  } finally {
    uploading.value = false
  }
}

const viewDocument = async (doc: Document) => {
  const url = await getDocumentUrl(doc.id)
  if (url) {
    viewingDoc.value = doc
    pdfUrl.value = url
    showPdfViewer.value = true
  } else {
    toast.add({
      title: 'Error',
      description: 'Failed to load document',
      color: 'error'
    })
  }
}

const downloadDocument = async (doc: Document) => {
  const url = await getDocumentUrl(doc.id)
  if (url) {
    window.open(url, '_blank')
  }
}

const confirmDeleteDoc = (doc: Document) => {
  docToDelete.value = doc
  showDeleteDocModal.value = true
}

const handleDeleteDoc = async () => {
  if (!docToDelete.value) return
  
  const success = await deleteDocument(docToDelete.value.id)
  
  if (success) {
    toast.add({
      title: 'Success',
      description: 'Document deleted successfully',
      color: 'success'
    })
    showDeleteDocModal.value = false
    docToDelete.value = null
    // Refresh documents
    await fetchDocuments({ inspectionId })
  } else {
    toast.add({
      title: 'Error',
      description: 'Failed to delete document',
      color: 'error'
    })
  }
}

const formatDocDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Page header -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <UButton
          to="/admin/inspections"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
        />
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Inspection Details
          </h1>
          <p class="text-gray-500 dark:text-gray-400">
            {{ inspection?.propertyAddress || 'Loading...' }}
          </p>
        </div>
      </div>
      
      <div v-if="!isEditing && inspection" class="flex gap-2">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-upload"
          @click="showUploadModal = true"
        >
          Upload Document
        </UButton>
        <UButton
          color="primary"
          icon="i-lucide-pencil"
          @click="startEditing"
        >
          Edit
        </UButton>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading && !inspection" class="space-y-4">
      <USkeleton class="h-32" />
      <USkeleton class="h-64" />
    </div>

    <!-- Content -->
    <template v-else-if="inspection">
      <!-- Agent info card -->
      <UCard v-if="selectedAgent" class="bg-primary-50 dark:bg-primary-900/20">
        <div class="flex items-center gap-4">
          <UAvatar
            :text="selectedAgent.fullName[0]"
            size="lg"
          />
          <div>
            <NuxtLink
              :to="`/agents/${selectedAgent.id}`"
              class="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
            >
              {{ selectedAgent.fullName }}
            </NuxtLink>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              {{ selectedAgent.brokerageName }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ selectedAgent.email }} · {{ selectedAgent.phone }}
            </p>
          </div>
        </div>
      </UCard>

      <!-- View mode -->
      <UCard v-if="!isEditing">
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <UBadge
                :color="getStatusColor(inspection.status)"
                variant="subtle"
                size="lg"
                class="mt-1"
              >
                {{ inspection.status }}
              </UBadge>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500 dark:text-gray-400">Inspection Date</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ formatDate(inspection.inspectionDate) }}
              </p>
            </div>
          </div>

          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Property Address</p>
            <p class="text-gray-900 dark:text-white">
              {{ inspection.propertyAddress }}
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Inspector</p>
            <p class="text-gray-900 dark:text-white">
              {{ inspection.inspectorName }}
            </p>
          </div>

          <div v-if="inspection.notes">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
            <p class="text-gray-900 dark:text-white whitespace-pre-wrap">
              {{ inspection.notes }}
            </p>
          </div>

          <div class="pt-4 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
            Created {{ new Date(inspection.createdAt).toLocaleDateString() }}
          </div>
        </div>
      </UCard>

      <!-- Edit mode -->
      <UCard v-else>
        <form @submit.prevent="handleSave" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Inspection Date" name="inspectionDate" required>
              <UInput
                v-model="editForm.inspectionDate"
                type="date"
              />
            </UFormField>

            <UFormField label="Status" name="status">
              <USelect
                v-model="editForm.status"
                :items="INSPECTION_STATUSES"
              />
            </UFormField>
          </div>

          <UFormField label="Property Address" name="propertyAddress" required>
            <UTextarea
              v-model="editForm.propertyAddress"
              placeholder="123 Main Street, City, State 12345"
              :rows="2"
            />
          </UFormField>

          <UFormField label="Inspector Name" name="inspectorName" required>
            <UInput
              v-model="editForm.inspectorName"
              placeholder="Inspector name"
              icon="i-lucide-user"
            />
          </UFormField>

          <UFormField label="Notes" name="notes">
            <UTextarea
              v-model="editForm.notes"
              placeholder="Additional notes about the inspection..."
              :rows="3"
            />
          </UFormField>

          <div class="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
            <UButton
              color="neutral"
              variant="outline"
              @click="cancelEditing"
            >
              Cancel
            </UButton>
            <UButton
              type="submit"
              color="primary"
              :loading="loading"
            >
              Save Changes
            </UButton>
          </div>
        </form>
      </UCard>

      <!-- Documents section -->
      <UCard v-if="!isEditing">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Documents
            </h2>
            <UButton
              size="sm"
              color="primary"
              variant="soft"
              icon="i-lucide-upload"
              @click="showUploadModal = true"
            >
              Upload
            </UButton>
          </div>
        </template>

        <div v-if="docsLoading" class="space-y-3">
          <USkeleton v-for="i in 2" :key="i" class="h-16" />
        </div>

        <div v-else-if="documents.length === 0" class="text-center py-8">
          <UIcon name="i-lucide-file-text" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-gray-500 dark:text-gray-400 mb-2">No documents uploaded yet</p>
          <p class="text-sm text-gray-400 dark:text-gray-500">
            Upload inspection reports, agreements, or other related documents.
          </p>
        </div>

        <div v-else class="divide-y divide-gray-200 dark:divide-gray-800">
          <div
            v-for="doc in documents"
            :key="doc.id"
            class="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-lucide-file-text" class="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div class="min-w-0">
                <p class="font-medium text-gray-900 dark:text-white truncate">
                  {{ doc.title }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ doc.category }} · {{ formatFileSize(doc.fileSize) }} · {{ formatDocDate(doc.createdAt) }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-eye"
                size="sm"
                @click="viewDocument(doc)"
              />
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-download"
                size="sm"
                @click="downloadDocument(doc)"
              />
              <UButton
                color="error"
                variant="ghost"
                icon="i-lucide-trash-2"
                size="sm"
                @click="confirmDeleteDoc(doc)"
              />
            </div>
          </div>
        </div>
      </UCard>
    </template>

    <!-- Not found -->
    <UCard v-else class="text-center py-12">
      <UIcon name="i-lucide-file-x" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Inspection not found
      </h2>
      <p class="text-gray-500 dark:text-gray-400 mb-4">
        The inspection you're looking for doesn't exist or has been deleted.
      </p>
      <UButton to="/admin/inspections" color="primary">
        Back to Inspections
      </UButton>
    </UCard>

    <!-- Upload modal -->
    <UModal v-model:open="showUploadModal">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Upload Document
              </h3>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-x"
                size="sm"
                @click="showUploadModal = false"
              />
            </div>
          </template>

          <form @submit.prevent="handleUpload" class="space-y-4">
            <UFormField label="Title" name="title" required>
              <UInput
                v-model="uploadForm.title"
                placeholder="Document title"
              />
            </UFormField>

            <UFormField label="Category" name="category">
              <USelect
                v-model="uploadForm.category"
                :items="DOCUMENT_CATEGORIES"
              />
            </UFormField>

            <UFormField label="File" name="file" required>
              <input
                type="file"
                accept="*/*"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/20 dark:file:text-primary-400"
                @change="handleFileSelect"
              />
              <p class="text-xs text-gray-500 mt-1">PDF files recommended</p>
            </UFormField>

            <div class="flex justify-end gap-2 pt-4">
              <UButton
                type="button"
                color="neutral"
                variant="outline"
                @click="showUploadModal = false"
              >
                Cancel
              </UButton>
              <UButton
                type="submit"
                color="primary"
                :loading="uploading"
                :disabled="!uploadForm.file || !uploadForm.title"
              >
                Upload
              </UButton>
            </div>
          </form>
        </UCard>
      </template>
    </UModal>

    <!-- Delete document confirmation modal -->
    <UModal v-model:open="showDeleteDocModal">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Document
            </h3>
          </template>

          <p class="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete "{{ docToDelete?.title }}"? This action cannot be undone.
          </p>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="outline"
                @click="showDeleteDocModal = false"
              >
                Cancel
              </UButton>
              <UButton
                color="error"
                @click="handleDeleteDoc"
              >
                Delete
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Document Viewer modal -->
    <UModal v-model:open="showPdfViewer" :ui="{ content: 'max-w-5xl' }">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ viewingDoc?.title }}
              </h3>
              <div class="flex items-center gap-2">
                <UButton
                  color="primary"
                  variant="outline"
                  icon="i-lucide-download"
                  size="sm"
                  @click="downloadDocument(viewingDoc!)"
                >
                  Download
                </UButton>
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-x"
                  size="sm"
                  @click="showPdfViewer = false"
                />
              </div>
            </div>
          </template>

          <div class="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden" style="height: 70vh;">
            <!-- PDF files -->
            <object
              v-if="pdfUrl && viewingDoc?.mimeType === 'application/pdf'"
              :data="pdfUrl"
              type="application/pdf"
              class="w-full h-full"
            >
              <div class="flex flex-col items-center justify-center h-full p-8 text-center">
                <UIcon name="i-lucide-file-text" class="w-16 h-16 text-gray-400 mb-4" />
                <p class="text-gray-600 dark:text-gray-400 mb-4">Unable to display PDF in browser</p>
                <UButton color="primary" @click="downloadDocument(viewingDoc!)">
                  Download PDF
                </UButton>
              </div>
            </object>
            <!-- Non-PDF files -->
            <div v-else-if="pdfUrl" class="flex flex-col items-center justify-center h-full p-8 text-center">
              <UIcon name="i-lucide-file" class="w-16 h-16 text-gray-400 mb-4" />
              <p class="text-lg font-medium text-gray-900 dark:text-white mb-2">{{ viewingDoc?.fileName }}</p>
              <p class="text-gray-600 dark:text-gray-400 mb-4">This file type cannot be previewed in the browser</p>
              <UButton color="primary" @click="downloadDocument(viewingDoc!)">
                Download File
              </UButton>
            </div>
          </div>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
