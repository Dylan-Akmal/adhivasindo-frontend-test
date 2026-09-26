<template>
  <div
    class="task-card"
    :class="{ dragging: isDragging }"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="$emit('dragend', task.id)"
    @click="$emit('open', task.id)"
  >
    <img v-if="task.cover" :src="task.cover" class="task-cover" alt="" />
    <span class="label-chip" :class="task.label">{{ task.label }}</span>
    <div class="task-title">{{ task.title || '(Tanpa judul)' }}</div>
    <div v-if="task.description" class="task-desc">{{ task.description }}</div>

    <div v-if="progress" class="progress-bar-track">
      <div class="progress-bar-fill" :style="{ width: (progress.ratio * 100) + '%' }"></div>
    </div>

    <div class="task-meta-row">
      <div class="task-meta-left">
        <span v-if="task.priority">
          <span class="priority-dot" :class="task.priority"></span>
        </span>
        <span v-if="task.dueDate">
          <ion-icon :icon="calendarOutline"></ion-icon>{{ formattedDate }}
        </span>
        <span v-if="progress">
          <ion-icon :icon="checkboxOutline"></ion-icon>{{ progress.done }}/{{ progress.total }}
        </span>
        <span v-if="task.attachments && task.attachments.length">
          <ion-icon :icon="attachOutline"></ion-icon>{{ task.attachments.length }}
        </span>
      </div>
      <div class="task-avatars">
        <div
          v-for="id in task.assigneeIds"
          :key="id"
          class="avatar sm"
          :style="{ background: memberById(id)?.color || '#999' }"
          :title="memberById(id)?.name"
        >
          {{ memberInitials(id) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { IonIcon } from '@ionic/vue'
import { calendarOutline, checkboxOutline, attachOutline } from 'ionicons/icons'
import { memberById, memberInitials, checklistProgress } from '../store'

const props = defineProps({
  task: { type: Object, required: true },
  isDragging: { type: Boolean, default: false },
})
const emit = defineEmits(['open', 'dragend', 'dragstart'])

const progress = computed(() => checklistProgress(props.task))

const formattedDate = computed(() => {
  if (!props.task.dueDate) return ''
  const d = new Date(props.task.dueDate)
  if (Number.isNaN(d.getTime())) return props.task.dueDate
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
})

function onDragStart(e) {
  e.dataTransfer.setData('text/plain', props.task.id)
  e.dataTransfer.effectAllowed = 'move'
  emit('dragstart', props.task.id)
}
</script>
