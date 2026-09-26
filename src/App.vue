<template>
  <ion-app>
    <div class="app-shell">
      <div class="topbar">
        <div class="topbar-left">
          <div class="board-title">
            <ion-icon :icon="lockClosedOutline" style="font-size: 14px"></ion-icon>
            Adhivasindo Task Board
          </div>
          <div class="member-stack">
            <div
              v-for="m in members"
              :key="m.id"
              class="avatar"
              :style="{ background: m.color }"
              :title="m.name"
            >
              {{ memberInitials(m.id) }}
            </div>
          </div>
          <ion-button size="small" fill="outline">
            <ion-icon :icon="personAddOutline" slot="start"></ion-icon> Invite
          </ion-button>
        </div>

        <div class="topbar-right">
          <FilterBar :model-value="filters" @update:model-value="applyFilters" />
        </div>
      </div>

      <div class="board-wrap">
        <div class="board-columns">
          <BoardColumn
            v-for="col in filteredColumns"
            :key="col.column.id"
            :column="col.column"
            :tasks="col.tasks"
            :dragging-id="draggingId"
            @open-task="openTask"
            @add-task="openCreate"
            @remove-column="handleRemoveColumn"
            @drop-task="handleDrop"
            @drag-start="draggingId = $event"
            @drag-end="draggingId = null"
          />

          <div class="add-list-card">
            <button class="add-list-btn" @click="handleAddColumn">+ Add new List</button>
          </div>
        </div>
      </div>
    </div>

    <TaskModal
      :is-open="modalOpen"
      :mode="modalMode"
      :initial="activeTask"
      @close="modalOpen = false"
      @save="handleSave"
      @delete="handleDelete"
    />

    <ion-toast
      :is-open="toast.open"
      :message="toast.message"
      :duration="1800"
      position="bottom"
      @didDismiss="toast.open = false"
    ></ion-toast>
  </ion-app>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { IonApp, IonButton, IonIcon, IonToast } from '@ionic/vue'
import { lockClosedOutline, personAddOutline } from 'ionicons/icons'
import {
  board, members, memberInitials, addColumn, removeColumn,
  addTask, updateTask, deleteTask, moveTask, findTaskLocation,
} from './store'
import FilterBar from './components/FilterBar.vue'
import BoardColumn from './components/BoardColumn.vue'
import TaskModal from './components/TaskModal.vue'

const filters = reactive({ query: '', assigneeId: null, label: null, dueBefore: '' })
function applyFilters(newVal) {
  Object.assign(filters, newVal)
}

const filteredColumns = computed(() =>
  board.columns.map((column) => {
    const tasks = column.tasks.filter((t) => {
      if (filters.query) {
        const q = filters.query.toLowerCase()
        const hit = t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
        if (!hit) return false
      }
      if (filters.assigneeId && !t.assigneeIds.includes(filters.assigneeId)) return false
      if (filters.label && t.label !== filters.label) return false
      if (filters.dueBefore && (!t.dueDate || t.dueDate > filters.dueBefore)) return false
      return true
    })
    return { column, tasks }
  }),
)

const draggingId = ref(null)

const modalOpen = ref(false)
const modalMode = ref('create')
const activeTask = ref(null)
const activeColumnId = ref(null)

const toast = reactive({ open: false, message: '' })
function showToast(message) {
  toast.message = message
  toast.open = true
}

function openTask(taskId) {
  const loc = findTaskLocation(taskId)
  if (!loc) return
  modalMode.value = 'edit'
  activeTask.value = loc.col.tasks[loc.idx]
  activeColumnId.value = loc.col.id
  modalOpen.value = true
}

function openCreate(columnId) {
  modalMode.value = 'create'
  activeTask.value = null
  activeColumnId.value = columnId
  modalOpen.value = true
}

function handleSave(data) {
  if (modalMode.value === 'create') {
    addTask(activeColumnId.value, data)
    showToast('Task berhasil dibuat')
  } else {
    updateTask(activeTask.value.id, data)
    showToast('Task berhasil diperbarui')
  }
  modalOpen.value = false
}

function handleDelete() {
  if (activeTask.value) {
    deleteTask(activeTask.value.id)
    showToast('Task dihapus')
  }
  modalOpen.value = false
}

function handleAddColumn() {
  const name = window.prompt('Nama list baru:', 'List baru')
  if (name) addColumn(name)
}

function handleRemoveColumn(colId) {
  if (window.confirm('Hapus list ini beserta semua tasknya?')) {
    removeColumn(colId)
    showToast('List dihapus')
  }
}

function handleDrop({ taskId, columnId }) {
  moveTask(taskId, columnId)
  draggingId.value = null
  showToast('Task dipindahkan')
}
</script>
