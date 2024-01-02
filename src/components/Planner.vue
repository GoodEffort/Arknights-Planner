<script lang="ts" setup>
import AddOperators from './AddOperators.vue';
import SelectedOperators from './SelectedOperators.vue';
import { usePlannerStore } from '../store/planner-store';
import { onMounted, ref } from 'vue';
import { DotLoader } from "vue3-spinner";
import InventoryControls from './InventoryControls.vue';
import NeededItems from './NeededItems.vue';

const { loadCharacters, loadModules, loadSavedRecords, loadItems } = usePlannerStore();

const isLoading = ref(true);

onMounted(async () => {
    await Promise.all([loadCharacters(), loadModules(), loadItems()]);
    loadSavedRecords();
    isLoading.value = false;
});

</script>

<template>
    <div style="height: 100%;">
        <h1>Planner</h1>
        <div v-if="!isLoading">
            <SelectedOperators />
            <AddOperators />
            <InventoryControls />
            <NeededItems />
        </div>
        <DotLoader v-else />
    </div>
</template>