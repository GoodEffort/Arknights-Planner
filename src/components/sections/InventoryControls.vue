<script setup lang="ts">
import ItemsDisplay from '@/components/akplanner/ItemsDisplay.vue';
import PlannerSection from '@/components/akplanner/PlannerSection.vue';
import { usePlannerStore } from '@/store/planner-store';
import { storeToRefs } from 'pinia';

const { inventory } = storeToRefs(usePlannerStore());
</script>

<template>
    <PlannerSection title="Current Inventory" local-storage-id="inventory-collapsed">
        <ItemsDisplay v-model="inventory" :use-input="true" />
    </PlannerSection>
</template>