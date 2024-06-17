<script setup lang="ts">
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import ItemsDisplay from './ItemsDisplay.vue';
import { ref } from 'vue';
import PlannerSection from './PlannerSection.vue';

const { neededItems, neededItemsBreakdown } = storeToRefs(usePlannerStore());

const showBreakdown = ref(false);
</script>

<template>
    <PlannerSection title="Missing Items" local-storage-id="needed-items-collapsed">
        <button @click="showBreakdown = !showBreakdown">
            {{ showBreakdown ? "Hide" : "Show" }} Breakdown
        </button>
        <hr />
        <ItemsDisplay :display-items="showBreakdown ? neededItemsBreakdown : neededItems" />
    </PlannerSection>
</template>