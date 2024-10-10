<script setup lang="ts">
import ItemsDisplay from '@/components/ItemsDisplay.vue';
import PlannerSection from '@/components/PlannerSection.vue';
</script>

<template>
    <PlannerSection title="Current Inventory" local-storage-id="inventory-collapsed">
        <ItemsDisplay />
    </PlannerSection>
</template>