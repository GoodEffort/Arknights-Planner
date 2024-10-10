<script setup lang="ts">
import ItemsDisplay from '@/components/akplanner/ItemsDisplay.vue';
import PlannerSection from '@/components/akplanner/PlannerSection.vue';
</script>

<template>
    <PlannerSection title="Current Inventory" local-storage-id="inventory-collapsed">
        <ItemsDisplay />
    </PlannerSection>
</template>