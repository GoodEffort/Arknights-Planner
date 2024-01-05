<script setup lang="ts">
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { Item } from '../types/item';
import ItemsDisplay from './ItemsDisplay.vue';

const { recommendedFarmingItems, items } = storeToRefs(usePlannerStore());

const itemsToFarm = computed(() => {
    const itemsToFarm: { item: Item, count: number }[] = [];
    for (const [key, count] of Object.entries(recommendedFarmingItems.value)) {
        const item = items.value[key];
        itemsToFarm.push({ item, count });
    }
    return itemsToFarm.sort((a, b) => a.item.sortId - b.item.sortId);
});
</script>

<template>
    <ItemsDisplay
        :display-items="itemsToFarm"
        title="Recommended Items to Farm"
        local-storage-id="recommended-farming-collapsed"
    />
</template>