<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePlannerStore } from '../store/planner-store';
import { setImportData } from '../store/store-operator-functions';

const emit = defineEmits<{
  (e: 'imported'): void;
}>();

const { loadSavedRecords } = usePlannerStore();

const importString = ref('');

const importData = () => {
  if (importString.value) {
    setImportData(importString.value);
    loadSavedRecords();
    importString.value = '';
    emit('imported');
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
  <div class="mb-2">
    <h2>This will overwrite all data currently on the page with what you paste below!</h2>
  </div>
  <div>
    <textarea rows="10" cols="50" v-model="importString"></textarea>
  </div>
  <button class="btn btn-primary" @click="pasteFromClipboard">Paste from Clipboard</button>
  <hr />
  <button class="btn btn-success" @click="importData">Import Data</button>
</template>