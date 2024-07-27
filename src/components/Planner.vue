<script lang="ts" setup>
import AddOperators from './AddOperators.vue';
import SelectedOperators from './SelectedOperators.vue';
import { usePlannerStore } from '../store/planner-store';
import { onMounted, ref } from 'vue';
import { DotLoader } from "vue3-spinner";
import InventoryControls from './InventoryControls.vue';
import TotalCostOfPlan from './TotalCostOfPlan.vue';
import MissingItems from './MissingItems.vue';
import Farming from './Farming.vue';

const { loadCharacters, loadSavedRecords } = usePlannerStore();

const isLoading = ref(true);

onMounted(async () => {
    await loadCharacters();
    loadSavedRecords();
    isLoading.value = false;
});

</script>

<template>
    <div style="height: 100%;">
        <div v-if="!isLoading" class="mt-4">
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