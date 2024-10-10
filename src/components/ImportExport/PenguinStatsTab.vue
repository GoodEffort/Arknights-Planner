<script setup lang="ts">
import { usePlannerStore } from '@/store/planner-store';
import { storeToRefs } from 'pinia';
import { Inventory } from '@/store/store-inventory-functions';
import ImportExportTab from '@/components/importExport/ImportExportTab.vue';

type PenguinStatusImport = {
  '@type': "@penguin-statistics/planner/config";
  items: { id: string, have: number, need: number }[];
}

const emit = defineEmits<{
  (e: 'imported'): void;
}>();

const { totalCosts, inventory } = storeToRefs(usePlannerStore());

const exportData = () => {
  const needed = totalCosts.value;// itemListToInventory(itemsToFarm.value);
  const inv = inventory.value;

  const exportDataObject: PenguinStatusImport = {
    '@type': '@penguin-statistics/planner/config',
    items: []
  }

  for (const id in inv) {
    const have = inv[id];
    const exportItem: PenguinStatusImport['items'][0] = {
      id,
      need: needed[id] ?? 0,
      have
    };

    exportDataObject.items.push(exportItem);
  }

  return JSON.stringify(exportDataObject);
};

const importData = (is: string) => {
  const importDataObject = JSON.parse(is) as PenguinStatusImport;

  const inv: Inventory = JSON.parse(JSON.stringify(inventory.value));

  for (const item of importDataObject.items) {
    inv[item.id] = item.have;
  }

  inventory.value = inv;
};

exportData();
</script>

<template>
  <ImportExportTab :importData="importData" :exportData="exportData" @imported="emit('imported')">
    <template #export-info>
      <p>Copy this data to the clipboard and import it into the <a href="https://penguin-stats.io/planner"
          target="_blank">Penguin Stats Planner</a> to see more detailed farming data.</p>
    </template>
    <template #import-info>
      <p>Paste data from the <a href="https://penguin-stats.io/planner" target="_blank">Penguin Stats Planner</a> to
        import it here. The "needed" items are ignored.</p>
    </template>
  </ImportExportTab>
</template>