<script setup lang="ts">
import ItemsDisplay from './ItemsDisplay.vue';
import PlannerSection from './PlannerSection.vue';
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import { computed, onMounted } from 'vue';

const { missingItems, items, availableItems, testingNeededItems } = storeToRefs(usePlannerStore());

const craftingRecs = computed(() => {
    return Object.entries(missingItems.value.itemsToCraft).map(([itemId, count]) => {
        return {
            item: items.value[itemId],
            count
        }
    });
});

const farmingRecs = computed(() => {
    return Object.entries(missingItems.value.itemsToFarm).map(([itemId, count]) => {
        return {
            item: items.value[itemId],
            count
        }
    });
});

const availItems = computed(() => {
    return Object.entries(availableItems.value).map(([itemId, count]) => {
        return {
            item: items.value[itemId],
            count
        }
    }).filter(item => item.count > 0);
});

const leftoverItems = computed(() => {
    return Object.entries(missingItems.value.leftoverItems).map(([itemId, count]) => {
        return {
            item: items.value[itemId],
            count
        }
    }).filter(item => item.count > 0);
});

onMounted(() => {
    testingNeededItems.value = [
        {
            item: items.value["30094"],
            count: 3
        },
        {
            item: items.value["30115"],
            count: 15
        }
    ]
});
</script>

<template>
    <PlannerSection title="Crafting Recs" local-storage-id="crafting-recs">
        <div>Testing Needed Items</div>
        <ItemsDisplay :display-items="testingNeededItems" :controls="false" />
        <div>Available Items (testing)</div>
        <ItemsDisplay :display-items="availItems" :controls="false" />
        <div>Crafting Recs</div>
        <ItemsDisplay :display-items="craftingRecs" />
        <div>Farming Recs</div>
        <ItemsDisplay :display-items="farmingRecs" />
        <div>Leftover Items (testing)</div>
        <ItemsDisplay :display-items="leftoverItems" :controls="false" />
    </PlannerSection>
</template>