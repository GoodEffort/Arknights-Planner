<script setup lang="ts">
import { computed, ref } from 'vue';
import Modal from './Modal.vue';
import { usePlannerStore } from '../store/planner-store';

const props = defineProps<{
    modelValue: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
}>();

const { importSavedRecords } = usePlannerStore();

const importString = ref('');

const show = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const importData = () => {
  if (importString.value) {
    importSavedRecords(importString.value);
    show.value = false;
    importString.value = '';
  }
  else {
    alert('No data to import');
  }
}

const pasteFromClipboard = async () => {
  const text = await navigator.clipboard.readText();
  importString.value = text;
};
</script>

<template>
  <modal v-model="show">
    <template #header>
      Import Data
    </template>
    <template #body>
      <div class="mb-2">
        <h2>This will overwrite all data currently on the page with what you paste below!</h2>
      </div>
      <div>
        <textarea rows="10" cols="50" v-model="importString"></textarea>
      </div>
      <button class="btn btn-primary" @click="pasteFromClipboard">Paste from Clipboard</button>
    </template>
    <template #footer>
      <button class="btn btn-danger" @click="show = false">Cancel</button>
      <button class="btn btn-success" @click="importData">Import Data</button>
    </template>
  </modal>
</template>