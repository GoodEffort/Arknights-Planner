<script setup lang="ts">
import { usePlannerStore } from '@/store/planner-store';
import { storeToRefs } from 'pinia';
import ItemsDisplay from '@/components/akplanner/ItemsDisplay.vue';
import { computed, ref, watch } from 'vue';
import PlannerSection from '@/components/akplanner/PlannerSection.vue';
import { canCraft, getEXPValue, inventoryToList } from '@/store/store-inventory-functions';
import ReservedItemsModal from '@/components/modals/ReservedItemsModal.vue';
import ImportExportModal from '@/components/modals/ImportExportModal.vue';
import { getMissingItems, getNeededEXPItems, getNeededItems } from '@/store/store-item-functions.';

const {
    totalCosts, 
    inventory,
    items,
    battleRecords,
    lmdId,
    reservedItems,
    futureEventGains
} = storeToRefs(usePlannerStore());

const missingItems = computed(() => getMissingItems(
    totalCosts.value,
    JSON.parse(JSON.stringify(inventory.value)),
    lmdId.value,
    items.value,
    reservedItems.value,
    futureEventGains.value,
    []
));

const itemsToCraft = computed(() => inventoryToList(missingItems.value.itemsToCraft, items.value)
    .sort((a, b) => {
        const craftSort = (canCraft(b.item, inventory.value) ? 1 : 0) - (canCraft(a.item, inventory.value) ? 1 : 0);

        if (craftSort !== 0) {
            return craftSort;
        }
        else {
            return b.item.rarity.localeCompare(a.item.rarity);
        }
    })
);

const itemsToFarm = computed(() => [
    ...inventoryToList(missingItems.value.itemsToFarm, items.value),
    ...neededEXPItems.value
].sort((a, b) => a.item.sortId - b.item.sortId));

const totalEXPValueCost = computed(() => getEXPValue(totalCosts.value, items.value));
const inventoryEXPValue = computed(() => getEXPValue(inventory.value, items.value));

const neededEXPItems = computed(() => inventoryToList(
    getNeededEXPItems(
        totalEXPValueCost.value - inventoryEXPValue.value,
        battleRecords.value,
    ),
    items.value
));

const neededItems = computed(() => [
    ...getNeededItems(
        inventory.value,
        totalCosts.value,
        battleRecords.value,
        items.value,
    ),
    ...neededEXPItems.value,
].sort((a, b) => a.item.sortId - b.item.sortId));

type Tab = 'missing' | 'breakdown' | 'total';

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
        case 'breakdown':
            return itemsToFarm.value;
        case 'total':
            return totalCostsArray.value;
    }
});

const showReservedItemsModal = ref(false);
const showPenguinExportModal = ref(false);
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
            <li class="nav-item" @click="tab = 'breakdown'">
                <a class="nav-link" :class="{ 'active': tab === 'breakdown' }">Items to Farm/Craft</a>
            </li>
        </ul>
        <hr />
        <h3 v-if="tab === 'breakdown'" class="mb-4">Items To Farm</h3>
        <button v-if="tab === 'breakdown'" @click="showPenguinExportModal = true" class="mb-4">Penguin Stats Farming
            Plan Import</button>
        <ItemsDisplay :display-items="displayItems" :farming="tab === 'breakdown' || tab === 'missing'"
            :flash="tab === 'breakdown'" />
        <hr v-if="tab === 'breakdown'" />
        <h3 v-if="tab === 'breakdown'" class="mb-3">Items To Craft</h3>
        <div v-if="tab === 'breakdown'" class="mb-4">
            <button @click="showReservedItemsModal = true">Edit Reserved Items</button>
        </div>
        <ItemsDisplay v-if="tab === 'breakdown'" :display-items="itemsToCraft" :flash="tab === 'breakdown'" />
        <div v-if="tab === 'breakdown'">
            If using the +1/-1 buttons in the crafting section it will remove from the "Items to Farm" section above
            first.
        </div>
        <ReservedItemsModal v-model="showReservedItemsModal" />
        <ImportExportModal default-tab="penguin-stats" v-model="showPenguinExportModal" />
    </PlannerSection>
</template>

<style scoped>
.nav-pills .nav-link {
    cursor: pointer;
}
</style>