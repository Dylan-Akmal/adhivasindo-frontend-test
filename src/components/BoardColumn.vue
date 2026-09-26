<template>
  <div
    class="column"
    :class="{ 'drag-over': isOver }"
    @dragover.prevent="isOver = true"
    @dragleave="isOver = false"
    @drop="onDrop"
  >
    <div class="column-header">
      <div class="column-header-left">
        <span>{{ column.name }}</span>
        <span class="column-count">{{ tasks.length }}</span>
      </div>
      <div class="column-actions">
        <ion-button fill="clear" size="small" @click="$emit('add-task', column.id)">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-button>
        <ion-button fill="clear" size="small" @click="$emit('remove-column', column.id)">
          <ion-icon :icon="ellipsisVerticalOutline"></ion-icon>
        </ion-button>
      </div>
    </div>

    <div class="task-list">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :is-dragging="draggingId === task.id"
        @open="$emit('open-task', $event)"
        @dragstart="$emit('drag-start', $event)"
        @dragend="$emit('drag-end')"
      />
      <div v-if="!tasks.length" class="empty-column-hint">Belum ada task</div>
    </div>

    <button class="add-task-btn" @click="$emit('add-task', column.id)">+ Tambah task</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { IonButton, IonIcon } from '@ionic/vue'
import { addOutline, ellipsisVerticalOutline } from 'ionicons/icons'
import TaskCard from './TaskCard.vue'

const props = defineProps({
  column: { type: Object, required: true },
  tasks: { type: Array, required: true },
  draggingId: { type: String, default: null },
})
const emit = defineEmits(['open-task', 'add-task', 'remove-column', 'drop-task', 'drag-end', 'drag-start'])

const isOver = ref(false)

function onDrop(e) {
  isOver.value = false
  const taskId = e.dataTransfer.getData('text/plain')
  if (taskId) emit('drop-task', { taskId, columnId: props.column.id })
}
</script>
