<script setup lang="ts">
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { Item } from '../types/item';
import ItemsDisplay from './ItemsDisplay.vue';
import getEfficientToFarmMats from '../data/farmingdata';

const { items, inventory, neededItems, workShopFormulas } = storeToRefs(usePlannerStore());

const recommendedFarmingItems = computed(() => {
    const availableItems: { [key: string]: number } = {};

    for (const [key, count] of Object.entries(inventory.value)) {
        if (count > 0) {
            availableItems[key] = count;

            const neededItem = neededItems.value.find(i => i.item.itemId === key);
            if (neededItem) {
                availableItems[key] -= neededItem.count;
                if (availableItems[key] < 0) {
                    availableItems[key] = 0;
                }
            }
        }
    }

    const farmingList: { [key: string]: number } = {}

    for (const { item, count } of neededItems.value) {
        const efficientItems: { item: Item, count: number }[] = [];

        getEfficientToFarmMats(item, count, workShopFormulas.value, items.value, efficientItems);

        if (efficientItems.length > 0) {
            for (const { item, count } of efficientItems) {
                if (farmingList[item.itemId] === undefined) {
                    farmingList[item.itemId] = 0;
                }
                farmingList[item.itemId] += count;
            }
        }
        else {
            if (farmingList[item.itemId] === undefined) {
                farmingList[item.itemId] = 0;
            }
            farmingList[item.itemId] += count;
        }
    }

    for (const [key] of Object.entries(farmingList)) {
        if (availableItems[key] !== undefined) {
            farmingList[key] -= availableItems[key];
            if (farmingList[key] < 0) {
                delete farmingList[key];
            }
        }
    }

    return farmingList;
});

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
    <ItemsDisplay :display-items="itemsToFarm" title="Recommended Items to Farm"
        local-storage-id="recommended-farming-collapsed" />
</template>