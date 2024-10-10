<script setup lang="ts">
import { ref } from 'vue';
import { usePlannerStore } from '../store/planner-store';
import { convertCSVInventory } from '../data/arkprts-to-record';
import { storeToRefs } from 'pinia';


const { inventory, items } = storeToRefs(usePlannerStore());

const importString = ref('');
const exportString = ref('');

const importData = () => {
    const csv = convertCSVInventory(importString.value);
    const inv = JSON.parse(JSON.stringify(inventory.value));
    
    for (const itemid in csv) {
        if (items.value[itemid] !== undefined) {
            inv[itemid] = csv[itemid];
        }
    }

    inventory.value = inv;
};

const exportData = () => {
    const inv = inventory.value;
    const exportData = Object.keys(inv).map(key => `${key},${inv[key]}`).join('\n');
    exportString.value = `Item ID, Quantity\n${exportData}`;
}

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
            <div class="mb-2">
            </div>
            <div class="my-4">
                <textarea rows="10" cols="50" readonly>{{ exportString }}</textarea>
            </div>
            <button class="btn btn-success" @click="copyToClipboard">Copy To Clipboard</button>
        </div>
        <div class="col">
            <h2>Import Data</h2>
            <div class="mb-2">
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