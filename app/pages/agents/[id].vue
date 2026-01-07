<script setup lang="ts">
import type { Agent, Document, Inspection } from '~/types'

const route = useRoute()
const agentId = route.params.id as string

const { fetchAgent, updateAgent, loading: agentLoading } = useAgents()
const { documents, fetchDocuments, deleteDocument, getDocumentUrl, formatFileSize, loading: docsLoading } = useDocuments()
const { inspections, fetchInspections, loading: inspectionsLoading } = useInspections()
const toast = useToast()

const agent = ref<Agent | null>(null)
const activeTab = ref('profile')
const isEditing = ref(false)
const editForm = ref<Partial<Agent>>({})

// Delete document modal
const showDeleteDocModal = ref(false)
const docToDelete = ref<Document | null>(null)

// PDF Viewer
const showPdfViewer = ref(false)
const pdfUrl = ref('')
const viewingDoc = ref<Document | null>(null)

// Fetch data
onMounted(async () => {
  const data = await fetchAgent(agentId)
  if (data) {
    agent.value = data
    editForm.value = { ...data }
  }
  
  await Promise.all([
    fetchDocuments({ agentId }),
    fetchInspections({ agentId })
  ])
  
  // Check if edit mode requested via query param
  if (route.query.edit === 'true') {
    isEditing.value = true
  }
})

const tabs = [
  { label: 'Profile', value: 'profile', icon: 'i-lucide-user' },
  { label: 'Documents', value: 'documents', icon: 'i-lucide-file-text' },
  { label: 'Inspections', value: 'inspections', icon: 'i-lucide-clipboard-check' }
]

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
]

// Get inspection info for a document
const getInspectionForDoc = (doc: Document) => {
  if (!doc.inspectionId) return null
  return inspections.value.find(i => i.id === doc.inspectionId)
}

// Profile editing
const startEditing = () => {
  editForm.value = { ...agent.value }
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  editForm.value = { ...agent.value }
}

const saveProfile = async () => {
  if (!agent.value) return
  
  const updated = await updateAgent(agent.value.id, editForm.value)
  
  if (updated) {
    agent.value = updated
    isEditing.value = false
    toast.add({
      title: 'Success',
      description: 'Profile updated successfully',
      color: 'success'
    })
  } else {
    toast.add({
      title: 'Error',
      description: 'Failed to update profile',
      color: 'error'
    })
  }
}

// Document viewing
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

// Document deletion
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
  } else {
    toast.add({
      title: 'Error',
      description: 'Failed to delete document',
      color: 'error'
    })
  }
  
  showDeleteDocModal.value = false
  docToDelete.value = null
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-4">
        <UButton
          to="/agents"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
        />
        <div v-if="agent">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ agent.fullName }}
          </h1>
          <p class="text-gray-500 dark:text-gray-400">
            {{ agent.brokerageName }}
          </p>
        </div>
        <USkeleton v-else class="h-14 w-48" />
      </div>
      
      <UBadge
        v-if="agent"
        :color="agent.status === 'active' ? 'success' : 'neutral'"
        size="lg"
      >
        {{ agent.status }}
      </UBadge>
    </div>

    <!-- Tabs -->
    <UTabs v-model="activeTab" :items="tabs" />

    <!-- Profile tab -->
    <UCard v-if="activeTab === 'profile'">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Profile Information
          </h2>
          <UButton
            v-if="!isEditing"
            color="neutral"
            variant="outline"
            icon="i-lucide-pencil"
            @click="startEditing"
          >
            Edit
          </UButton>
        </div>
      </template>

      <div v-if="agent" class="space-y-6">
        <!-- View mode -->
        <div v-if="!isEditing" class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
            <p class="text-gray-900 dark:text-white">{{ agent.fullName }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <p class="text-gray-900 dark:text-white">{{ agent.email }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Phone</p>
            <p class="text-gray-900 dark:text-white">{{ agent.phone }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Brokerage</p>
            <p class="text-gray-900 dark:text-white">{{ agent.brokerageName }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">License Number</p>
            <p class="text-gray-900 dark:text-white">{{ agent.licenseNumber || '—' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <p class="text-gray-900 dark:text-white capitalize">{{ agent.status }}</p>
          </div>
          <div class="sm:col-span-2">
            <p class="text-sm text-gray-500 dark:text-gray-400">Address</p>
            <p class="text-gray-900 dark:text-white">{{ agent.address || '—' }}</p>
          </div>
        </div>

        <!-- Edit mode -->
        <form v-else @submit.prevent="saveProfile" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Full Name" name="fullName" required class="sm:col-span-2">
              <UInput v-model="editForm.fullName" />
            </UFormField>
            <UFormField label="Email" name="email" required>
              <UInput v-model="editForm.email" type="email" />
            </UFormField>
            <UFormField label="Phone" name="phone" required>
              <UInput v-model="editForm.phone" />
            </UFormField>
            <UFormField label="Brokerage Name" name="brokerageName" required>
              <UInput v-model="editForm.brokerageName" />
            </UFormField>
            <UFormField label="License Number" name="licenseNumber">
              <UInput v-model="editForm.licenseNumber" />
            </UFormField>
            <UFormField label="Status" name="status">
              <USelect v-model="editForm.status" :items="statusOptions" />
            </UFormField>
            <UFormField label="Address" name="address" class="sm:col-span-2">
              <UTextarea v-model="editForm.address" :rows="2" />
            </UFormField>
          </div>
          
          <div class="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              @click="cancelEditing"
            >
              Cancel
            </UButton>
            <UButton
              type="submit"
              color="primary"
              :loading="agentLoading"
            >
              Save Changes
            </UButton>
          </div>
        </form>
      </div>
      
      <div v-else class="space-y-4">
        <USkeleton class="h-4 w-3/4" />
        <USkeleton class="h-4 w-1/2" />
        <USkeleton class="h-4 w-2/3" />
      </div>
    </UCard>

    <!-- Documents tab -->
    <UCard v-if="activeTab === 'documents'">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Documents
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Documents are uploaded via inspections
          </p>
        </div>
      </template>

      <div v-if="documents.length === 0" class="empty-state">
        <UIcon name="i-lucide-file-text" class="empty-state-icon" />
        <p class="empty-state-title">No documents</p>
        <p class="empty-state-description">
          Documents are uploaded through inspections. Create an inspection first to upload documents.
        </p>
        <UButton
          :to="`/admin/inspections/new?agentId=${agentId}`"
          color="primary"
          class="mt-4"
        >
          Create Inspection
        </UButton>
      </div>

      <div v-else class="divide-y divide-gray-200 dark:divide-gray-800">
        <div
          v-for="doc in documents"
          :key="doc.id"
          class="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
        >
          <div class="w-10 h-10 rounded-lg bg-error-100 dark:bg-error-900/20 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-file-text" class="w-5 h-5 text-error-600 dark:text-error-400" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-900 dark:text-white truncate">
              {{ doc.title }}
            </p>
            <div class="text-sm text-gray-500 dark:text-gray-400 space-y-0.5">
              <p>{{ doc.category }} · {{ formatFileSize(doc.fileSize) }} · {{ formatDate(doc.createdAt) }}</p>
              <p v-if="getInspectionForDoc(doc)" class="flex items-center gap-1">
                <UIcon name="i-lucide-clipboard-check" class="w-3.5 h-3.5" />
                <NuxtLink 
                  :to="`/admin/inspections/${doc.inspectionId}`"
                  class="text-primary-500 hover:underline"
                >
                  {{ getInspectionForDoc(doc)?.propertyAddress }} 
                  ({{ formatDate(getInspectionForDoc(doc)!.inspectionDate) }})
                </NuxtLink>
              </p>
              <p v-else class="text-gray-400 dark:text-gray-500 italic">
                Not linked to an inspection
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
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

    <!-- Inspections tab -->
    <UCard v-if="activeTab === 'inspections'">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Inspections
          </h2>
          <UButton
            :to="`/admin/inspections/new?agentId=${agentId}`"
            color="primary"
            icon="i-lucide-plus"
          >
            Add Inspection
          </UButton>
        </div>
      </template>

      <div v-if="inspections.length === 0" class="empty-state">
        <UIcon name="i-lucide-clipboard-check" class="empty-state-icon" />
        <p class="empty-state-title">No inspections</p>
        <p class="empty-state-description">
          Schedule an inspection for this agent. You can upload documents to inspections.
        </p>
        <UButton
          :to="`/admin/inspections/new?agentId=${agentId}`"
          color="primary"
          class="mt-4"
        >
          Add Inspection
        </UButton>
      </div>

      <div v-else class="divide-y divide-gray-200 dark:divide-gray-800">
        <NuxtLink
          v-for="inspection in inspections"
          :key="inspection.id"
          :to="`/admin/inspections/${inspection.id}`"
          class="block py-4 first:pt-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-4 px-4 transition-colors"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ inspection.propertyAddress }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(inspection.inspectionDate) }} · {{ inspection.inspectorName }}
              </p>
              <p v-if="inspection.notes" class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                {{ inspection.notes }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <UBadge
                :color="inspection.status === 'completed' ? 'success' : inspection.status === 'scheduled' ? 'info' : 'error'"
                variant="subtle"
              >
                {{ inspection.status }}
              </UBadge>
              <UIcon name="i-lucide-chevron-right" class="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </NuxtLink>
      </div>
    </UCard>

    <!-- Document Viewer modal -->
    <UModal 
      v-model:open="showPdfViewer" 
      :ui="{ content: 'max-w-4xl' }"
      :title="viewingDoc?.title || 'Document Viewer'"
      :description="viewingDoc?.fileName || 'View document'"
    >
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

    <!-- Delete document modal -->
    <UModal 
      v-model:open="showDeleteDocModal"
      title="Delete Document"
      description="Confirm document deletion"
    >
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-error-100 dark:bg-error-900/20 flex items-center justify-center">
                <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-error-600 dark:text-error-400" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Document
                </h3>
              </div>
            </div>
          </template>

          <p class="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete <strong>{{ docToDelete?.title }}</strong>?
            This action cannot be undone.
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
  </div>
</template>
