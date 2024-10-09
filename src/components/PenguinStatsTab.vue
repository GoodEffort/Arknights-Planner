<script setup lang="ts">
import { ref } from 'vue';
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import { Inventory } from '../store/store-inventory-functions';

type PenguinStatusImport = {
  '@type': "@penguin-statistics/planner/config";
  items: { id: string, have: number, need: number }[];
}

const emit = defineEmits<{
  (e: 'imported'): void;
}>();

const { totalCosts, inventory } = storeToRefs(usePlannerStore());

const exportString = ref('');
const importString = ref('');

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

  exportString.value = JSON.stringify(exportDataObject);
};

const importData = () => {
  if (importString.value) {
    const importDataObject = JSON.parse(importString.value) as PenguinStatusImport;

    const inv: Inventory = JSON.parse(JSON.stringify(inventory.value));

    for (const item of importDataObject.items) {
      inv[item.id] = item.have;
    }

    inventory.value = inv;

    importString.value = '';
    emit('imported');
  } else {
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

exportData();
</script>

<template>

  <div class="row">
    <div class="col">
      <h2>Export Data</h2>
      <textarea rows="10" cols="50" readonly>{{ exportString }}</textarea>
      <p>Copy this data to the clipboard and import it into the <a href="https://penguin-stats.io/planner"
          target="_blank">Penguin Stats Planner</a> to see more detailed farming data.</p>
      <button class="btn btn-success" @click="copyToClipboard">Copy To Clipboard</button>
    </div>
    <div class="col">
      <h2>Import Data</h2>
      <textarea rows="10" cols="50" v-model="importString"></textarea>
      <p>Paste data from the <a href="https://penguin-stats.io/planner" target="_blank">Penguin Stats Planner</a> to
        import it here. The "needed" items are ignored.</p>
      <button class="btn btn-primary" @click="pasteFromClipboard">Paste from Clipboard</button>
      <hr />
      <button class="btn btn-success" @click="importData">Import Data</button>
    </div>
  </div>
</template>