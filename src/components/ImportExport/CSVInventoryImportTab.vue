<script setup lang="ts">
import { usePlannerStore } from '@/store/planner-store';
import { convertCSVInventory } from '@/data/arkprts-to-record';
import { storeToRefs } from 'pinia';
import ImportExportTab from '@/components/importExport/ImportExportTab.vue';

const { inventory, items } = storeToRefs(usePlannerStore());

const importData = (is: string) => {
    const csv = convertCSVInventory(is);
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
    return `Item ID, Quantity\n${exportData}`;
}
</script>

<template>
    <ImportExportTab 
        :importData="importData" 
        :exportData="exportData"
    ></ImportExportTab>
</template>