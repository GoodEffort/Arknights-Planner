<script lang="ts" setup>
import PlannerSection from './PlannerSection.vue';
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import OperatorControls from './OperatorControls.vue';

const { selectedOperators } = storeToRefs(usePlannerStore());
</script>

<template>
    <PlannerSection title="Selected Operators" :initial-state="true">
        <div class="container">
            <div class="row mb-3 py-3" v-for="character in selectedOperators" :key="character.operator.id">
                <OperatorControls :selected-operator="character" />
            </div>
        </div>
    </PlannerSection>
</template>

<style scoped>
html.dark .row {
    background-color: #050505;
}

.row {
    background-color: #F0F0F0;
    border-radius: 5px;
    border: 1px solid #1a1a1a;
}
</style>