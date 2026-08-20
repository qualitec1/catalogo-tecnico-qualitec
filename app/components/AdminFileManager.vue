<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center">
            <span class="material-symbols-outlined mr-2 text-blue-600">cloud_upload</span>
            Upload de Arquivos
          </h2>
          <p class="text-xs text-gray-500 mt-1">Envie arquivos para o R2 e obtenha links públicos</p>
        </div>
      </div>

      <!-- Upload Area -->
      <div 
        @drop.prevent="handleDrop"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'"
        class="border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer hover:border-blue-400"
        @click="triggerFileInput"
      >
        <input 
          ref="fileInput"
          type="file" 
          multiple
          class="hidden"
          @change="handleFileSelect"
          accept="*/*"
        />
        
        <span class="material-symbols-outlined text-5xl text-gray-400 mb-3 block">upload_file</span>
        <p class="text-sm font-semibold text-gray-700 mb-1">
          Arraste arquivos aqui ou clique para selecionar
        </p>
        <p class="text-xs text-gray-500">
          Suporta: PDF, Imagens, Excel, Word, etc.
        </p>
      </div>

      <!-- Files to Upload Preview -->
      <div v-if="pendingFiles.length > 0" class="mt-4 space-y-2">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-xs font-bold text-gray-700 uppercase">Arquivos para Upload</h4>
          <button
            @click="clearPendingFiles"
            class="text-xs text-gray-500 hover:text-red-600 transition-colors"
          >
            Limpar todos
          </button>
        </div>
        <div v-for="(pending, idx) in pendingFiles" :key="idx" class="bg-gray-50 rounded border border-gray-200 p-3">
          <div class="flex items-start space-x-3">
            <span class="material-symbols-outlined text-gray-400 text-2xl mt-1">
              {{ getFileIconByName(pending.file.name) }}
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-gray-500 mb-1">Nome original: {{ pending.file.name }}</p>
              <div class="flex items-center space-x-2">
                <input
                  v-model="pending.customName"
                  @input="updateCustomName(idx)"
                  placeholder="Nome customizado (opcional)"
                  class="flex-1 text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500"
                />
                <button
                  @click="removePendingFile(idx)"
                  class="text-gray-400 hover:text-red-600 transition-colors"
                  title="Remover"
                >
                  <span class="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
              <p class="text-[10px] text-gray-400 mt-1">
                Preview: {{ pending.finalName || 'Nome será gerado automaticamente' }}
              </p>
            </div>
          </div>
        </div>
        <button
          @click="uploadPendingFiles"
          :disabled="uploading"
          class="w-full px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50"
        >
          {{ uploading ? 'Enviando...' : `Enviar ${pendingFiles.length} arquivo(s)` }}
        </button>
      </div>

      <!-- Upload Progress -->
      <div v-if="uploading" class="mt-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-gray-700">Enviando arquivos...</span>
          <span class="text-xs text-gray-500">{{ uploadProgress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: uploadProgress + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Files Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Arquivos Enviados ({{ files.length }})
        </h3>
        <button
          @click="refreshFiles"
          :disabled="loading"
          class="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors disabled:opacity-50"
        >
          <span class="material-symbols-outlined text-sm align-middle">refresh</span>
          Atualizar
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="text-xs text-gray-500 mt-3">Carregando arquivos...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="files.length === 0" class="p-12 text-center">
        <span class="material-symbols-outlined text-6xl text-gray-300 mb-3 block">folder_open</span>
        <p class="text-sm text-gray-500">Nenhum arquivo enviado ainda</p>
      </div>

      <!-- Files Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-wider">Preview</th>
              <th class="px-4 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-wider">Arquivo</th>
              <th class="px-4 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-wider">Tipo</th>
              <th class="px-4 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-wider">Tamanho</th>
              <th class="px-4 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-wider">Data</th>
              <th class="px-4 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-wider">Link</th>
              <th class="px-4 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-wider text-center">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="file in files" :key="file.id" class="hover:bg-gray-50 transition-colors">
              <!-- Preview -->
              <td class="px-4 py-3">
                <div class="w-12 h-12 rounded border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img 
                    v-if="isImage(file.file_type)" 
                    :src="file.file_url" 
                    :alt="file.original_filename"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="material-symbols-outlined text-gray-400 text-2xl">
                    {{ getFileIcon(file.file_type) }}
                  </span>
                </div>
              </td>

              <!-- Filename -->
              <td class="px-4 py-3">
                <p class="text-xs font-semibold text-gray-900 truncate max-w-xs" :title="file.original_filename">
                  {{ file.original_filename }}
                </p>
                <p v-if="file.description" class="text-[10px] text-gray-500 truncate max-w-xs">
                  {{ file.description }}
                </p>
              </td>

              <!-- Type -->
              <td class="px-4 py-3">
                <span class="text-xs text-gray-600">{{ file.file_type || 'N/A' }}</span>
              </td>

              <!-- Size -->
              <td class="px-4 py-3">
                <span class="text-xs text-gray-600">{{ formatFileSize(file.file_size) }}</span>
              </td>

              <!-- Date -->
              <td class="px-4 py-3">
                <span class="text-xs text-gray-600">{{ formatDate(file.uploaded_at) }}</span>
              </td>

              <!-- Link -->
              <td class="px-4 py-3">
                <div class="flex items-center space-x-2">
                  <input 
                    :value="file.file_url" 
                    readonly
                    class="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded px-2 py-1 w-64 truncate"
                  />
                  <button
                    @click="copyToClipboard(file.file_url, file.original_filename)"
                    class="text-blue-600 hover:text-blue-700 transition-colors"
                    title="Copiar link"
                  >
                    <span class="material-symbols-outlined text-lg">content_copy</span>
                  </button>
                </div>
              </td>

              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-center space-x-2">
                  <a
                    :href="file.file_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-gray-600 hover:text-blue-600 transition-colors"
                    title="Abrir em nova aba"
                  >
                    <span class="material-symbols-outlined text-lg">open_in_new</span>
                  </a>
                  <button
                    @click="confirmDelete(file)"
                    class="text-gray-600 hover:text-red-600 transition-colors"
                    title="Deletar"
                  >
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteModal" class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full border border-gray-200">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <span class="material-symbols-outlined text-red-600 text-3xl mr-3">warning</span>
            <h3 class="text-base font-bold text-gray-900">Confirmar Exclusão</h3>
          </div>
          <p class="text-sm text-gray-600 mb-6">
            Tem certeza que deseja deletar <strong>{{ deleteModal.original_filename }}</strong>?
            Esta ação não pode ser desfeita.
          </p>
          <div class="flex justify-end space-x-3">
            <button
              @click="deleteModal = null"
              class="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="deleteFile"
              :disabled="deleting"
              class="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50"
            >
              {{ deleting ? 'Deletando...' : 'Deletar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface UploadedFile {
  id: number
  filename: string
  original_filename: string
  file_url: string
  file_type: string | null
  file_size: number | null
  uploaded_at: string
  description: string | null
}

interface PendingFile {
  file: File
  customName: string
  finalName: string
}

const supabase = useSupabaseClient()
const fileInput = ref<HTMLInputElement | null>(null)
const files = ref<UploadedFile[]>([])
const pendingFiles = ref<PendingFile[]>([])
const loading = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const isDragging = ref(false)
const deleteModal = ref<UploadedFile | null>(null)
const deleting = ref(false)

const emit = defineEmits(['toast'])

onMounted(() => {
  fetchFiles()
})

async function fetchFiles() {
  loading.value = true
  try {
    const res = await $fetch<{ files?: any[] }>('/api/admin/files')
    files.value = res?.files || []
  } catch (err: any) {
    console.error('Error fetching files:', err)
    emit('toast', { message: 'Erro ao carregar arquivos', type: 'error' })
  } finally {
    loading.value = false
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addPendingFiles(Array.from(target.files))
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer?.files) {
    addPendingFiles(Array.from(event.dataTransfer.files))
  }
}

function addPendingFiles(fileList: File[]) {
  for (const file of fileList) {
    pendingFiles.value.push({
      file,
      customName: '',
      finalName: generatePreviewName(file.name, '')
    })
  }
}

function generatePreviewName(originalName: string, customName: string): string {
  if (!customName.trim()) {
    return 'auto_' + cleanFileName(originalName)
  }
  
  const extension = getFileExtension(originalName)
  const cleanCustom = cleanFileName(customName)
  return extension ? `${cleanCustom}${extension}` : cleanCustom
}

function cleanFileName(name: string): string {
  // Remove extension if present
  const lastDotIndex = name.lastIndexOf('.')
  const nameWithoutExt = lastDotIndex > 0 ? name.substring(0, lastDotIndex) : name
  
  return nameWithoutExt
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9_-]/g, '_')   // Replace spaces and special characters
    .replace(/_+/g, '_')             // Replace multiple underscores with single
    .replace(/^_|_$/g, '')           // Remove leading/trailing underscores
}

function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.')
  return lastDotIndex > 0 ? filename.substring(lastDotIndex) : ''
}

function updateCustomName(idx: number) {
  const pending = pendingFiles.value[idx]
  pending.finalName = generatePreviewName(pending.file.name, pending.customName)
}

function removePendingFile(idx: number) {
  pendingFiles.value.splice(idx, 1)
}

function clearPendingFiles() {
  pendingFiles.value = []
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function uploadPendingFiles() {
  if (pendingFiles.value.length === 0) return

  uploading.value = true
  uploadProgress.value = 0

  try {
    const totalFiles = pendingFiles.value.length
    let completedFiles = 0

    for (const pending of pendingFiles.value) {
      await uploadSingleFile(pending.file, pending.customName)
      completedFiles++
      uploadProgress.value = Math.round((completedFiles / totalFiles) * 100)
    }

    emit('toast', { message: `${totalFiles} arquivo(s) enviado(s) com sucesso!`, type: 'success' })
    await fetchFiles()
    clearPendingFiles()
  } catch (err: any) {
    console.error('Upload error:', err)
    emit('toast', { message: 'Erro ao enviar arquivos', type: 'error' })
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

async function uploadSingleFile(file: File, customName: string) {
  const formData = new FormData()
  formData.append('file', file)
  
  // Send custom name if provided
  if (customName.trim()) {
    formData.append('customName', customName.trim())
  }

  // Upload to R2
  const uploadResponse = await fetch('/api/upload-r2', {
    method: 'POST',
    body: formData
  })

  if (!uploadResponse.ok) {
    throw new Error('Upload failed')
  }

  const { url, filename } = await uploadResponse.json()

  // Save to database
  const { error } = await supabase
    .from('uploaded_files')
    .insert({
      filename: filename,
      original_filename: file.name,
      file_url: url,
      file_type: file.type || null,
      file_size: file.size
    })

  if (error) throw error
}

function copyToClipboard(url: string, filename: string) {
  navigator.clipboard.writeText(url).then(() => {
    emit('toast', { message: `Link copiado: ${filename}`, type: 'success' })
  }).catch(() => {
    emit('toast', { message: 'Erro ao copiar link', type: 'error' })
  })
}

function confirmDelete(file: UploadedFile) {
  deleteModal.value = file
}

async function deleteFile() {
  if (!deleteModal.value) return

  deleting.value = true
  try {
    await $fetch(`/api/admin/files?id=${deleteModal.value.id}`, {
      method: 'DELETE'
    })

    emit('toast', { message: 'Arquivo deletado com sucesso', type: 'success' })
    await fetchFiles()
    deleteModal.value = null
  } catch (err: any) {
    console.error('Delete error:', err)
    emit('toast', { message: 'Erro ao deletar arquivo', type: 'error' })
  } finally {
    deleting.value = false
  }
}

function refreshFiles() {
  fetchFiles()
}

function isImage(fileType: string | null): boolean {
  if (!fileType) return false
  return fileType.startsWith('image/')
}

function getFileIcon(fileType: string | null): string {
  if (!fileType) return 'description'
  if (fileType.includes('pdf')) return 'picture_as_pdf'
  if (fileType.includes('sheet') || fileType.includes('excel')) return 'table_chart'
  if (fileType.includes('word') || fileType.includes('document')) return 'description'
  if (fileType.includes('video')) return 'videocam'
  if (fileType.includes('audio')) return 'audio_file'
  return 'insert_drive_file'
}

function getFileIconByName(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop() || ''
  if (ext === 'pdf') return 'picture_as_pdf'
  if (['xlsx', 'xls', 'csv'].includes(ext)) return 'table_chart'
  if (['doc', 'docx'].includes(ext)) return 'description'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image'
  if (['mp4', 'mov', 'avi'].includes(ext)) return 'videocam'
  if (['mp3', 'wav'].includes(ext)) return 'audio_file'
  return 'insert_drive_file'
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'N/A'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
