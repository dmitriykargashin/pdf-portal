<script setup lang="ts">
import type { InspectionWithAgent, Document } from '~/types'

const route = useRoute()
const toast = useToast()

const inspectionId = route.params.id as string

const { agentId } = useAuth()
const { fetchInspection, formatDate, getStatusColor, loading } = useInspections()
const { documents, fetchDocuments, getDocumentUrl, formatFileSize, loading: docsLoading } = useDocuments()

const inspection = ref<InspectionWithAgent | null>(null)

// Document Viewer
const showDocViewer = ref(false)
const docUrl = ref('')
const viewingDoc = ref<Document | null>(null)

// Fetch data
onMounted(async () => {
  const data = await fetchInspection(inspectionId)
  
  if (data) {
    // Verify this inspection belongs to the logged-in agent
    if (data.agentId !== agentId.value) {
      toast.add({
        title: 'Access Denied',
        description: 'You do not have access to this inspection',
        color: 'error'
      })
      await navigateTo('/portal/inspections')
      return
    }
    
    inspection.value = data as InspectionWithAgent
  } else {
    toast.add({
      title: 'Error',
      description: 'Inspection not found',
      color: 'error'
    })
    await navigateTo('/portal/inspections')
  }
  
  // Fetch documents for this inspection
  await fetchDocuments({ inspectionId })
})

// Document viewing
const viewDocument = async (doc: Document) => {
  const url = await getDocumentUrl(doc.id)
  if (url) {
    viewingDoc.value = doc
    docUrl.value = url
    showDocViewer.value = true
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
</script>

<template>
  <div class="space-y-6">
    <!-- Back button -->
    <div>
      <UButton
        to="/portal/inspections"
        variant="ghost"
        color="neutral"
        icon="i-lucide-arrow-left"
      >
        Back to Inspections
      </UButton>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="space-y-4">
      <USkeleton class="h-8 w-1/2" />
      <USkeleton class="h-32" />
    </div>

    <!-- Inspection details -->
    <template v-else-if="inspection">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ inspection.propertyAddress }}
          </h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">
            Inspection on {{ formatDate(inspection.inspectionDate) }}
          </p>
        </div>
        <UBadge
          :color="getStatusColor(inspection.status)"
          variant="subtle"
          size="lg"
        >
          {{ inspection.status }}
        </UBadge>
      </div>

      <!-- Inspection Info Card -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Inspection Details
          </h2>
        </template>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Property Address</p>
            <p class="font-medium text-gray-900 dark:text-white">{{ inspection.propertyAddress }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Inspection Date</p>
            <p class="font-medium text-gray-900 dark:text-white">{{ formatDate(inspection.inspectionDate) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Inspector</p>
            <p class="font-medium text-gray-900 dark:text-white">{{ inspection.inspectorName }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <UBadge :color="getStatusColor(inspection.status)" variant="subtle">
              {{ inspection.status }}
            </UBadge>
          </div>
          <div v-if="inspection.notes" class="sm:col-span-2">
            <p class="text-sm text-gray-500 dark:text-gray-400">Notes</p>
            <p class="font-medium text-gray-900 dark:text-white">{{ inspection.notes }}</p>
          </div>
        </div>
      </UCard>

      <!-- Documents Card -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Documents
            </h2>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ documents.length }} document{{ documents.length !== 1 ? 's' : '' }}
            </span>
          </div>
        </template>

        <div v-if="docsLoading" class="space-y-3">
          <USkeleton v-for="i in 2" :key="i" class="h-16" />
        </div>

        <div v-else-if="documents.length === 0" class="empty-state py-8">
          <UIcon name="i-lucide-file-text" class="empty-state-icon" />
          <p class="empty-state-title">No documents</p>
          <p class="empty-state-description">
            No documents have been uploaded for this inspection yet.
          </p>
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
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ doc.category }} · {{ formatFileSize(doc.fileSize) }} · {{ doc.fileName }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-eye"
                size="sm"
                @click="viewDocument(doc)"
              >
                View
              </UButton>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-download"
                size="sm"
                @click="downloadDocument(doc)"
              >
                Download
              </UButton>
            </div>
          </div>
        </div>
      </UCard>
    </template>

    <!-- Document Viewer modal -->
    <UModal 
      v-model:open="showDocViewer" 
      :ui="{ content: 'max-w-5xl' }"
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
                  size="sm"
                  @click="showDocViewer = false"
                />
              </div>
            </div>
          </template>

          <div class="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden" style="height: 70vh;">
            <!-- PDF files -->
            <object
              v-if="docUrl && viewingDoc?.mimeType === 'application/pdf'"
              :data="docUrl"
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
            <div v-else-if="docUrl" class="flex flex-col items-center justify-center h-full p-8 text-center">
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
