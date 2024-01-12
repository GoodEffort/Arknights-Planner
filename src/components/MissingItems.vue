<script setup lang="ts">
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import ItemsDisplay from './ItemsDisplay.vue';

const { neededItems } = storeToRefs(usePlannerStore());
</script>

<template>
    <ItemsDisplay
        :display-items="neededItems"
        title="Missing Items"
        local-storage-id="needed-items-collapsed"
    />
</template>