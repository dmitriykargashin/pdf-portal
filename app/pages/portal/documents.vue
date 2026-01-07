<script setup lang="ts">
import type { Document } from '~/types'

const { agentId } = useAuth()
const { documents, fetchDocuments, getDocumentUrl, formatFileSize, loading } = useDocuments()
const toast = useToast()

// PDF Viewer
const showPdfViewer = ref(false)
const pdfUrl = ref('')
const viewingDoc = ref<Document | null>(null)

onMounted(() => {
  if (agentId.value) {
    fetchDocuments({ agentId: agentId.value })
  }
})

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
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        My Documents
      </h1>
      <p class="text-gray-500 dark:text-gray-400">
        View and download your PDF documents
      </p>
    </div>

    <!-- Documents -->
    <UCard>
      <div v-if="loading" class="space-y-4">
        <USkeleton v-for="i in 3" :key="i" class="h-16" />
      </div>

      <div v-else-if="documents.length === 0" class="empty-state">
        <UIcon name="i-lucide-file-text" class="empty-state-icon" />
        <p class="empty-state-title">No documents</p>
        <p class="empty-state-description">
          Documents uploaded by your administrator will appear here.
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
              {{ doc.category }} · {{ formatFileSize(doc.fileSize) }} · {{ formatDate(doc.createdAt) }}
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
              color="primary"
              variant="outline"
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

    <!-- PDF Viewer modal -->
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
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-x"
                @click="showPdfViewer = false"
              />
            </div>
          </template>

          <div class="pdf-viewer-container">
            <iframe
              v-if="pdfUrl"
              :src="pdfUrl"
              class="w-full h-[600px]"
              frameborder="0"
            />
          </div>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
