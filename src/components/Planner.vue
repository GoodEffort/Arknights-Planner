<script lang="ts" setup>
import AddOperators from './AddOperators.vue';
import SelectedOperators from './SelectedOperators.vue';
import { usePlannerStore } from '../store/planner-store';
import { onMounted, ref } from 'vue';
import { DotLoader } from "vue3-spinner";
import InventoryControls from './InventoryControls.vue';
import NeededItems from './NeededItems.vue';
import RecommendedFarm from './RecommendedFarm.vue';
import TotalCostOfPlan from './TotalCostOfPlan.vue';

const { loadCharacters, loadModules, loadSavedRecords, loadItems, loadWorkshopFormulas } = usePlannerStore();

const isLoading = ref(true);

onMounted(async () => {
    await Promise.all([loadCharacters(), loadModules(), loadItems(), loadWorkshopFormulas()]);
    loadSavedRecords();
    isLoading.value = false;
});

</script>

<template>
    <div style="height: 100%;">
        <h1>Planner</h1>
        <div v-if="!isLoading">
            <SelectedOperators />
            <TotalCostOfPlan />
            <NeededItems />
            <RecommendedFarm />
            <InventoryControls />
            <AddOperators />
        </div>
        <DotLoader v-else />
    </div>
</template>