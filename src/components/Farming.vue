<script setup lang="ts">
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import PlannerSection from './PlannerSection.vue';
import ImageFinder from './ImageFinder.vue';

const { recomendedStages } = storeToRefs(usePlannerStore());
</script>

<template>
    <PlannerSection title="Farming" local-storage-id="farming-collapsed">
        <div v-for="{ stage, item } in recomendedStages" :key="stage">
            <span><ImageFinder :subject="item" class="img-thumbnail" />&nbsp;&nbsp; {{ stage }} </span>
        </div>
    </PlannerSection>
</template>

<style scoped>
span {
    display: flex;
    align-items: center;
}
span img {
    max-width: 50px;
}
</style>