<script setup lang="ts">
import { computed } from 'vue';
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import ItemsDisplay from './ItemsDisplay.vue';

const { items, totalCosts } = storeToRefs(usePlannerStore());

const totalCostsArray = computed(() => {
    const costsDict = totalCosts.value ?? [];

    const costs = Object.entries(costsDict).map(([key, count]) => {
        const item = items.value[key];
        return { item, count };
    });

    return costs
        .filter(cost => cost.count > 0)
        .sort((a, b) => a.item.sortId - b.item.sortId);
});
</script>

<template>
    <PlannerSection title="Total Cost" local-storage-id="total-needed-items-collapsed">
        <ItemsDisplay :display-items="totalCostsArray" :controls="false" />
    </PlannerSection>
</template>