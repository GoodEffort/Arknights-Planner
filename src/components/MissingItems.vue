<script setup lang="ts">
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import ItemsDisplay from './ItemsDisplay.vue';
import { computed, ref, watch } from 'vue';
import PlannerSection from './PlannerSection.vue';
import { inventoryToList } from '../store/store-inventory-functions';

const { itemsToCraft, itemsToFarm, totalCosts, neededItems, items } = storeToRefs(usePlannerStore());

type Tab = 'missing' | 'farm' | 'craft' | 'total';

const tab = ref<Tab>((localStorage.getItem('missingItemTab') as Tab | null | '') || 'missing');
watch(tab, () => localStorage.setItem('missingItemTab', tab.value));

const totalCostsArray = computed(() =>
    inventoryToList(totalCosts.value, items.value)
        .filter(cost => cost.count > 0)
        .sort((a, b) => a.item.sortId - b.item.sortId));

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
                <a class="nav-link" :class="{ 'active': tab === 'total' }">Total Cost</a>
            </li>
            <li class="nav-item" @click="tab = 'missing'">
                <a class="nav-link" :class="{ 'active': tab === 'missing' }">Missing Items</a>
            </li>
            <li class="nav-item" @click="tab = 'farm'">
                <a class="nav-link" :class="{ 'active': tab === 'farm' }">Items to Farm/Breakdown</a>
            </li>
            <li class="nav-item" @click="tab = 'craft'">
                <a class="nav-link" :class="{ 'active': tab === 'craft' }">Crafting Recommendations (Beta)</a>
            </li>
        </ul>
        <hr />
        <ItemsDisplay :display-items="displayItems" :farming="tab === 'farm' || tab === 'missing'" />
    </PlannerSection>
</template>

<style scoped>
.nav-pills .nav-link {
    cursor: pointer;
}
</style>