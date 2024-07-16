<script setup lang="ts">
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import PlannerSection from './PlannerSection.vue';
import ImageFinder from './ImageFinder.vue';

const { recomendedStages } = storeToRefs(usePlannerStore());
</script>

<template>
    <PlannerSection title="Farming" local-storage-id="farming-collapsed">
        <div class="container">
            <div class="row">
                <div v-for="{ stage, item } in recomendedStages" :key="stage" class="col-md-2 col-6">
                    <div>
                        <ImageFinder :subject="item" class="img-thumbnail" />
                    </div>
                    <div class="mb-3">{{ stage }}</div>
                </div>
            </div>
        </div>
    </PlannerSection>
</template>

<style scoped>
div.row img {
    width: 100px;
    height: 100px;
    object-fit: contain;
}
</style>