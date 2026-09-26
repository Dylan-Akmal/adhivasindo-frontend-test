import { reactive, watch } from 'vue'

const STORAGE_KEY = 'kanban-board-data-v1'

export const members = [
  { id: 'm1', name: 'Dylan Akmal', color: '#6366f1' },
  { id: 'm2', name: 'Sari Wulandari', color: '#ec4899' },
  { id: 'm3', name: 'Budi Santoso', color: '#22c55e' },
  { id: 'm4', name: 'Nadia Putri', color: '#f59e0b' },
  { id: 'm5', name: 'Rian Hidayat', color: '#0ea5e9' },
  { id: 'm6', name: 'Citra Ayu', color: '#a855f7' },
]

export const labelOptions = ['Feature', 'Bug', 'Issue', 'Undefined']
export const priorityOptions = ['Low', 'Medium', 'High']

function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function uid(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

function seedTask(overrides) {
  return {
    id: uid('task'),
    title: '',
    description: '',
    assigneeIds: [],
    dueDate: null,
    label: 'Undefined',
    priority: null,
    checklist: [],
    attachments: [],
    cover: null,
    createdAt: Date.now(),
    ...overrides,
  }
}

function defaultData() {
  return {
    columns: [
      {
        id: uid('col'),
        name: 'To Do',
        tasks: [
          seedTask({
            title: 'Riset kompetitor untuk landing page baru',
            description: 'Kumpulkan referensi desain dari 5 kompetitor sejenis.',
            assigneeIds: ['m1', 'm2'],
            dueDate: '2026-09-30',
            label: 'Feature',
            priority: 'Medium',
            checklist: [
              { id: uid('chk'), text: 'Kumpulkan referensi', done: true },
              { id: uid('chk'), text: 'Rangkum poin desain', done: false },
            ],
          }),
          seedTask({
            title: 'Perbaiki bug proses checkout',
            description: 'Total belanja tidak update saat kupon dipakai.',
            assigneeIds: ['m3'],
            dueDate: '2026-09-27',
            label: 'Bug',
            priority: 'High',
          }),
        ],
      },
      {
        id: uid('col'),
        name: 'Doing',
        tasks: [
          seedTask({
            title: 'Desain wireframe halaman utama',
            description: 'Wireframe low-fidelity untuk revisi landing page.',
            assigneeIds: ['m4', 'm5'],
            dueDate: '2026-10-02',
            label: 'Feature',
            priority: 'Medium',
            checklist: [
              { id: uid('chk'), text: 'Wireframe desktop', done: true },
              { id: uid('chk'), text: 'Wireframe mobile', done: false },
            ],
          }),
        ],
      },
      { id: uid('col'), name: 'Review', tasks: [] },
      { id: uid('col'), name: 'Done', tasks: [] },
      { id: uid('col'), name: 'Rework', tasks: [] },
    ],
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('Gagal memuat data lokal', e)
  }
  return defaultData()
}

export const board = reactive(load())

watch(
  board,
  (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    } catch (e) {
      console.warn('Gagal menyimpan data lokal', e)
    }
  },
  { deep: true },
)

export function memberById(id) {
  return members.find((m) => m.id === id)
}

export function memberInitials(id) {
  const m = memberById(id)
  return m ? initials(m.name) : '?'
}

export function addColumn(name) {
  board.columns.push({ id: uid('col'), name: name || 'List baru', tasks: [] })
}

export function removeColumn(colId) {
  const idx = board.columns.findIndex((c) => c.id === colId)
  if (idx !== -1) board.columns.splice(idx, 1)
}

export function findTaskLocation(taskId) {
  for (const col of board.columns) {
    const idx = col.tasks.findIndex((t) => t.id === taskId)
    if (idx !== -1) return { col, idx }
  }
  return null
}

export function addTask(colId, data) {
  const col = board.columns.find((c) => c.id === colId)
  if (!col) return null
  const task = seedTask(data)
  col.tasks.push(task)
  return task
}

export function updateTask(taskId, patch) {
  const loc = findTaskLocation(taskId)
  if (!loc) return
  Object.assign(loc.col.tasks[loc.idx], patch)
}

export function deleteTask(taskId) {
  const loc = findTaskLocation(taskId)
  if (!loc) return
  loc.col.tasks.splice(loc.idx, 1)
}

export function moveTask(taskId, targetColId, targetIndex = null) {
  const loc = findTaskLocation(taskId)
  if (!loc) return
  const targetCol = board.columns.find((c) => c.id === targetColId)
  if (!targetCol) return
  const [task] = loc.col.tasks.splice(loc.idx, 1)
  if (targetIndex === null || targetIndex > targetCol.tasks.length) {
    targetCol.tasks.push(task)
  } else {
    targetCol.tasks.splice(targetIndex, 0, task)
  }
}

export function checklistProgress(task) {
  if (!task.checklist || task.checklist.length === 0) return null
  const done = task.checklist.filter((c) => c.done).length
  return { done, total: task.checklist.length, ratio: done / task.checklist.length }
}

export { uid, initials }
