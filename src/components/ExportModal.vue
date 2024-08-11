<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Modal from './Modal.vue';
import { usePlannerStore } from '../store/planner-store';

const props = defineProps<{
    modelValue: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
}>();

const { exportSavedRecords } = usePlannerStore();

const exportString = ref('');

const show = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const exportData = () => {
  exportString.value = JSON.stringify(exportSavedRecords());
};

const copyToClipboard = () => {
  navigator.clipboard.writeText(exportString.value);
  show.value = false;
};

watch(show, (newVal) => {
    if (newVal) {
        exportData();
    }
});
</script>

<template>
  <modal v-model="show">
    <template #header>
      Export Data
    </template>
    <template #body>
      <div>
        <textarea rows="10" cols="50" readonly>{{ exportString }}</textarea>
      </div>
    </template>
    <template #footer>
      <button class="btn btn-danger" @click="show = false">Cancel</button>
      <button class="btn btn-success" @click="copyToClipboard">Copy To Clipboard</button>
    </template>
  </modal>
</template>