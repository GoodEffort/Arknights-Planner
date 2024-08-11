<script setup lang="ts">
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import ItemsDisplay from './ItemsDisplay.vue';
import { computed, ref, watch } from 'vue';
import PlannerSection from './PlannerSection.vue';
import { canCraft } from '../store/store-inventory-functions';

const { neededItems, missingItems, items, inventory } = storeToRefs(usePlannerStore());

const tab = ref<'missing' | 'farm' | 'craft'>(localStorage.getItem('missingItemTab') as 'missing' | 'farm' | 'craft' | null | '' || 'missing');
watch(tab, () => localStorage.setItem('missingItemTab', tab.value));

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