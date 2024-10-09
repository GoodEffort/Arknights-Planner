<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Modal from './Modal.vue';
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';

const props = defineProps<{
    modelValue: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
}>();

type PenguinStatusImport = {
    '@type': "@penguin-statistics/planner/config";
    items: {id: string, have: number, need: number }[];
}

const { totalCosts, inventory } = storeToRefs(usePlannerStore());

const exportString = ref('');

const show = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

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

const copyToClipboard = () => {
  navigator.clipboard.writeText(exportString.value);
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
      Export Penguin Stats Farming Data
    </template>
    <template #body>
      <div>
        <textarea rows="10" cols="50" readonly>{{ exportString }}</textarea>
        <p>Copy this data to the clipboard and import it into the <a href="https://penguin-stats.io/planner" target="_blank">Penguin Stats Planner</a> to see more detailed farming data.</p>
      </div>
    </template>
    <template #footer>
      <button class="btn btn-danger" @click="show = false">Cancel</button>
      <button class="btn btn-success" @click="copyToClipboard">Copy To Clipboard</button>
    </template>
  </modal>
</template>