<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePlannerStore } from '../store/planner-store';
import { setImportData } from '../store/store-operator-functions';

const emit = defineEmits<{
  (e: 'imported'): void;
}>();

const { loadSavedRecords, exportSavedRecords } = usePlannerStore();

const importString = ref('');
const exportString = ref(JSON.stringify(exportSavedRecords()));

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
};

const pasteFromClipboard = async () => {
  const text = await navigator.clipboard.readText();
  importString.value = text;
};

const copyToClipboard = () => {
  navigator.clipboard.writeText(exportString.value);
};
</script>

<template>
  <div class="row">
    <div class="col">
      <h2>Export Data</h2>
      <div class="my-4">
        <textarea rows="10" cols="50" readonly>{{ exportString }}</textarea>
      </div>
      <button class="btn btn-success" @click="copyToClipboard">Copy To Clipboard</button>
    </div>
    <div class="col">
      <h2>Import Data</h2>
      <div class="mb-2">
        <h5>This will overwrite all data currently on the page with what you paste below!</h5>
      </div>
      <div class="my-4">
        <textarea rows="10" cols="50" v-model="importString"></textarea>
      </div>
      <button class="btn btn-primary" @click="pasteFromClipboard">Paste from Clipboard</button>
      <hr />
      <button class="btn btn-success" @click="importData">Import Data</button>
    </div>
  </div>
</template>