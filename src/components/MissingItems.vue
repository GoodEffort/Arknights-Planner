<script setup lang="ts">
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import ItemsDisplay from './ItemsDisplay.vue';
import { computed, ref } from 'vue';
import PlannerSection from './PlannerSection.vue';

const { neededItems, missingItems, items } = storeToRefs(usePlannerStore());

const tab = ref<'missing' | 'farm' | 'craft'>(localStorage.getItem('missingItemTab') as 'missing' | 'farm' | 'craft' | null | '' || 'missing');

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
    }).sort((a, b) => a.item.sortId - b.item.sortId));

const displayItems = computed(() => {
    switch (tab.value) {
        case 'missing':
            return neededItems.value;
        case 'farm':
            return itemsToFarm.value;
        case 'craft':
            return itemsToCraft.value;
    }
})
</script>

<template>
    <PlannerSection title="Farming/Crafting Missing Items" local-storage-id="needed-items-collapsed">
        <ul class="nav nav-pills nav-fill">
            <li class="nav-item" @click="tab = 'missing'">
                <a class="nav-link" :class="{ 'active': tab === 'missing' }" href="#">Total Missing Items</a>
            </li>
            <li class="nav-item" @click="tab = 'farm'">
                <a class="nav-link" href="#" :class="{ 'active': tab === 'farm' }">Items to Farm / Item breakdown</a>
            </li>
            <li class="nav-item" @click="tab = 'craft'">
                <a class="nav-link" href="#" :class="{ 'active': tab === 'craft' }">Crafting Recommendations</a>
            </li>
        </ul>
        <hr />
        <ItemsDisplay :display-items="displayItems" />
    </PlannerSection>
</template>