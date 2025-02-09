<script setup lang="ts">
import { usePlannerStore } from '@/store/planner-store';
import { setImportData } from '@/store/store-operator-functions';
import ImportExportTab from '@/components/datatabs/ImportExportTab.vue';

const emit = defineEmits<{
  (e: 'imported'): void;
}>();

const { loadSavedRecords, exportSavedRecords } = usePlannerStore();

const importData = (is: string) => {
  setImportData(is);
  loadSavedRecords();
};
</script>

<template>
  <ImportExportTab 
    :importData="importData" 
    :exportData="() => JSON.stringify(exportSavedRecords())"
    @imported="emit('imported')"
  />
</template>