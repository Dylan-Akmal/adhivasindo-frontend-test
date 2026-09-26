<template>
  <div class="filter-bar">
    <ion-button fill="outline" size="small" @click="showFilters = !showFilters">
      <ion-icon :icon="filterOutline" slot="start"></ion-icon> Filter
    </ion-button>
    <ion-searchbar
      :model-value="modelValue.query"
      @ionInput="update('query', $event.detail.value)"
      placeholder="Search Tasks"
      show-clear-button="focus"
    ></ion-searchbar>

    <template v-if="showFilters">
      <ion-select
        :value="modelValue.assigneeId"
        @ionChange="update('assigneeId', $event.detail.value)"
        interface="popover"
        placeholder="Assignee"
        fill="outline"
      >
        <ion-select-option :value="null">Semua assignee</ion-select-option>
        <ion-select-option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</ion-select-option>
      </ion-select>

      <ion-select
        :value="modelValue.label"
        @ionChange="update('label', $event.detail.value)"
        interface="popover"
        placeholder="Label"
        fill="outline"
      >
        <ion-select-option :value="null">Semua label</ion-select-option>
        <ion-select-option v-for="l in labelOptions" :key="l" :value="l">{{ l }}</ion-select-option>
      </ion-select>

      <ion-input
        :value="modelValue.dueBefore"
        @ionInput="update('dueBefore', $event.detail.value)"
        type="date"
        fill="outline"
        placeholder="Due sebelum"
      ></ion-input>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { IonButton, IonIcon, IonSearchbar, IonSelect, IonSelectOption, IonInput } from '@ionic/vue'
import { filterOutline } from 'ionicons/icons'
import { members, labelOptions } from '../store'

const props = defineProps({ modelValue: { type: Object, required: true } })
const emit = defineEmits(['update:modelValue'])
const showFilters = ref(false)

function update(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>
