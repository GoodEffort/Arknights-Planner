<script lang="ts" setup>
import AddOperators from './AddOperators.vue';
import SelectedOperators from './SelectedOperators.vue';
import { usePlannerStore } from '../store/planner-store';
import { computed, onMounted, ref } from 'vue';
import { DotLoader } from "vue3-spinner";
import InventoryControls from './InventoryControls.vue';
import TotalCostOfPlan from './TotalCostOfPlan.vue';
import MissingItems from './MissingItems.vue';
import Farming from './Farming.vue';
import { storeToRefs } from 'pinia';

const { upload, loadCharacters, loadSavedRecords, exportSavedRecords } = usePlannerStore();
const { accessToken, cloudData } = storeToRefs(usePlannerStore());

const starting = ref(true);
const isLoading = ref(true);
const isSyncing = ref(false);

onMounted(async () => {
    await loadCharacters();
    loadSavedRecords();
    isLoading.value = false;
});

const showSync = computed(() => {
    if (starting.value) {
        return false;
    }

    if (!accessToken.value || accessToken.value === '') {
        return false;
    }

    const currentData = exportSavedRecords();
    return cloudData.value !== JSON.stringify(currentData);
});

const sync = async () => {
    isSyncing.value = true;
    await upload();
    isSyncing.value = false;
};

setTimeout(() => {
    starting.value = false;
}, 3000);
</script>

<template>
    <div style="height: 100%;">
        <div v-if="!isLoading" class="mt-4">
            <button v-if="showSync && !isLoading" class="btn btn-success" @click="sync" :disabled="isSyncing">{{ isSyncing ? 'Saving...' : 'Save To Drive' }}</button>
            <SelectedOperators />
            <TotalCostOfPlan />
            <MissingItems />
            <Farming />
            <InventoryControls />
            <AddOperators />
        </div>
        <DotLoader v-else />
    </div>
</template>