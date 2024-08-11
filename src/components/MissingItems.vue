<script setup lang="ts">
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import ItemsDisplay from './ItemsDisplay.vue';
import { computed, ref, watch } from 'vue';
import PlannerSection from './PlannerSection.vue';
import { canCraft } from '../store/store-inventory-functions';

const { totalCosts, neededItems, missingItems, items, inventory } = storeToRefs(usePlannerStore());

type Tab = 'missing' | 'farm' | 'craft' | 'total';

const tab = ref<Tab>((localStorage.getItem('missingItemTab') as Tab | null | '') || 'missing');
watch(tab, () => localStorage.setItem('missingItemTab', tab.value));

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

const itemsToFarm = computed(() =>
    Object.entries(missingItems.value.itemsToFarm).map(([itemId, count]) => {
        return {
            item: items.value[itemId],
            count
        }
    }).sort((a, b) => a.item.sortId - b.item.sortId));

const itemsToCraft = computed(() =>
    Object.entries(missingItems.value.itemsToCraft).map(([itemId, count]) => {
        return {
            item: items.value[itemId],
            count
        }
    }).sort((a, b) => {
        const craftSort = (canCraft(b.item, inventory.value) ? 1 : 0) - (canCraft(a.item, inventory.value) ? 1 : 0);

        if (craftSort !== 0) {
            return craftSort;
        }
        else {
            const aRarity = +(a.item.rarity.split('_')[1]);
            const bRarity = +(b.item.rarity.split('_')[1]);

            return bRarity - aRarity;
        }
    }));

const displayItems = computed(() => {
    switch (tab.value) {
        case 'missing':
            return neededItems.value;
        case 'farm':
            return itemsToFarm.value;
        case 'craft':
            return itemsToCraft.value;
        case 'total':
            return totalCostsArray.value;
    }
});
</script>

<template>
    <PlannerSection title="Missing Items and Recommendations" local-storage-id="needed-items-collapsed">
        <ul class="nav nav-pills nav-fill">
            <li class="nav-item" @click="tab = 'total'">
                <a class="nav-link" :class="{ 'active': tab === 'total' }" href="#">Total Cost</a>
            </li>
            <li class="nav-item" @click="tab = 'missing'">
                <a class="nav-link" :class="{ 'active': tab === 'missing' }" href="#">Missing Items</a>
            </li>
            <li class="nav-item" @click="tab = 'farm'">
                <a class="nav-link" href="#" :class="{ 'active': tab === 'farm' }">Items to Farm/Breakdown</a>
            </li>
            <li class="nav-item" @click="tab = 'craft'">
                <a class="nav-link" href="#" :class="{ 'active': tab === 'craft' }">Crafting Recommendations</a>
            </li>
        </ul>
        <hr />
        <ItemsDisplay :display-items="displayItems" :farming="tab === 'farm'" />
    </PlannerSection>
</template>