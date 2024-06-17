<script setup lang="ts">
import ItemsDisplay from './ItemsDisplay.vue';
import PlannerSection from './PlannerSection.vue';
</script>

<template>
    <PlannerSection title="Current Inventory" local-storage-id="inventory-collapsed">
        <ItemsDisplay />
    </PlannerSection>
</template>