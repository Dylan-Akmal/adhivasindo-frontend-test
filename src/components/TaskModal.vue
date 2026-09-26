<template>
  <ion-modal :is-open="isOpen" @didDismiss="close">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="toggleComplete">
            <ion-icon :icon="checkmarkCircleOutline" slot="start"></ion-icon>
            {{ draft.completed ? 'Selesai' : 'Mark Complete' }}
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button @click="handleDelete" color="danger" v-if="mode === 'edit'">
            <ion-icon :icon="trashOutline"></ion-icon>
          </ion-button>
          <ion-button @click="close">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="modal-grid">
        <div class="modal-col">
          <label class="cover-drop" for="cover-input">
            <img v-if="draft.cover" :src="draft.cover" alt="cover" />
            <template v-else>
              <ion-icon :icon="imageOutline" style="font-size: 22px"></ion-icon>
              <span>Add Cover Image</span>
            </template>
          </label>
          <input id="cover-input" type="file" accept="image/*" hidden @change="onCoverChange" />

          <div class="field-label">Judul task</div>
          <ion-input v-model="draft.title" placeholder="Judul task" fill="outline"></ion-input>

          <div class="field-row">
            <div>
              <div class="field-label">Assignee</div>
              <div class="assignee-picker">
                <div
                  v-for="m in members"
                  :key="m.id"
                  class="assignee-pick"
                  :class="{ active: draft.assigneeIds.includes(m.id) }"
                  @click="toggleAssignee(m.id)"
                >
                  <div class="avatar sm" :style="{ background: m.color }">{{ memberInitials(m.id) }}</div>
                  {{ m.name.split(' ')[0] }}
                </div>
              </div>
            </div>
            <div>
              <div class="field-label">Due Date</div>
              <ion-input v-model="draft.dueDate" type="date" fill="outline"></ion-input>
            </div>
          </div>

          <div class="field-row">
            <div>
              <div class="field-label">Label</div>
              <ion-select v-model="draft.label" interface="popover" fill="outline">
                <ion-select-option v-for="l in labelOptions" :key="l" :value="l">{{ l }}</ion-select-option>
              </ion-select>
            </div>
            <div>
              <div class="field-label">Priority</div>
              <ion-select v-model="draft.priority" interface="popover" fill="outline" placeholder="(opsional)">
                <ion-select-option :value="null">(opsional)</ion-select-option>
                <ion-select-option v-for="p in priorityOptions" :key="p" :value="p">{{ p }}</ion-select-option>
              </ion-select>
            </div>
          </div>

          <div class="field-label">Description</div>
          <ion-textarea v-model="draft.description" auto-grow fill="outline" placeholder="Tulis deskripsi task..."></ion-textarea>
        </div>

        <div class="modal-col">
          <div class="field-label">Attachments</div>
          <div v-for="(a, i) in draft.attachments" :key="i" class="attachment-row">
            <ion-icon :icon="documentOutline"></ion-icon>
            <span>{{ a }}</span>
            <ion-button size="small" fill="clear" color="medium" @click="draft.attachments.splice(i, 1)">
              <ion-icon :icon="closeOutline"></ion-icon>
            </ion-button>
          </div>
          <label class="cover-drop" style="height: 56px" for="attach-input">
            <span>Drag &amp; Drop files here atau browse from device</span>
          </label>
          <input id="attach-input" type="file" hidden multiple @change="onAttachChange" />

          <div class="field-label">
            Check List
            <span style="font-weight: 500; text-transform: none;">
              ({{ checklistDone }}/{{ draft.checklist.length }})
            </span>
          </div>
          <div class="progress-bar-track" v-if="draft.checklist.length">
            <div class="progress-bar-fill" :style="{ width: checklistRatio + '%' }"></div>
          </div>
          <div v-for="item in draft.checklist" :key="item.id" class="checklist-row" :class="{ done: item.done }">
            <ion-checkbox v-model="item.done"></ion-checkbox>
            <span>{{ item.text }}</span>
            <ion-button size="small" fill="clear" color="medium" @click="removeChecklistItem(item.id)">
              <ion-icon :icon="closeOutline"></ion-icon>
            </ion-button>
          </div>
          <ion-input
            v-model="newChecklistText"
            placeholder="Tambah subtask lalu tekan Enter"
            fill="outline"
            @keyup.enter="addChecklistItem"
          ></ion-input>
          <ion-button size="small" fill="outline" style="margin-top: 6px" @click="addChecklistItem">
            <ion-icon :icon="addOutline" slot="start"></ion-icon> Add subtask
          </ion-button>

          <div class="field-label">Activity</div>
          <div style="font-size: 0.78rem; color: var(--ink-soft)">
            Dibuat {{ createdAtLabel }}
          </div>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:8px; padding: 14px 20px 24px;">
        <ion-button fill="outline" color="medium" @click="close">Discard</ion-button>
        <ion-button @click="save">Save</ion-button>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup>
import { reactive, watch, computed, ref } from 'vue'
import {
  IonModal, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent,
  IonInput, IonTextarea, IonSelect, IonSelectOption, IonCheckbox,
} from '@ionic/vue'
import {
  closeOutline, trashOutline, checkmarkCircleOutline, imageOutline,
  documentOutline, addOutline,
} from 'ionicons/icons'
import { members, memberInitials, labelOptions, priorityOptions, uid } from '../store'

const props = defineProps({
  isOpen: Boolean,
  mode: { type: String, default: 'create' }, // 'create' | 'edit'
  initial: { type: Object, default: null },
})
const emit = defineEmits(['close', 'save', 'delete'])

function blankDraft() {
  return {
    title: '', description: '', assigneeIds: [], dueDate: null,
    label: 'Undefined', priority: null, checklist: [], attachments: [],
    cover: null, completed: false,
  }
}

const draft = reactive(blankDraft())
const newChecklistText = ref('')

watch(
  () => [props.isOpen, props.initial],
  () => {
    if (props.isOpen) {
      Object.assign(draft, blankDraft(), props.initial ? JSON.parse(JSON.stringify(props.initial)) : {})
    }
  },
  { immediate: true },
)

const checklistDone = computed(() => draft.checklist.filter((c) => c.done).length)
const checklistRatio = computed(() =>
  draft.checklist.length ? Math.round((checklistDone.value / draft.checklist.length) * 100) : 0,
)
const createdAtLabel = computed(() => {
  if (!draft.createdAt) return '-'
  return new Date(draft.createdAt).toLocaleString('id-ID')
})

function toggleAssignee(id) {
  const i = draft.assigneeIds.indexOf(id)
  if (i === -1) draft.assigneeIds.push(id)
  else draft.assigneeIds.splice(i, 1)
}

function toggleComplete() {
  draft.completed = !draft.completed
}

function addChecklistItem() {
  const text = newChecklistText.value?.trim?.() ?? ''
  if (!text) return
  draft.checklist.push({ id: uid('chk'), text, done: false })
  newChecklistText.value = ''
}
function removeChecklistItem(id) {
  const i = draft.checklist.findIndex((c) => c.id === id)
  if (i !== -1) draft.checklist.splice(i, 1)
}

function onCoverChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => { draft.cover = reader.result }
  reader.readAsDataURL(file)
}
function onAttachChange(e) {
  const files = Array.from(e.target.files || [])
  files.forEach((f) => draft.attachments.push(f.name))
  e.target.value = ''
}

function close() { emit('close') }
function save() { emit('save', JSON.parse(JSON.stringify(draft))) }
function handleDelete() { emit('delete') }
</script>
