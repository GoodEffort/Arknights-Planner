<script lang="ts" setup>
import PlannerSection from './PlannerSection.vue';
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import OperatorControls from './OperatorControls.vue';

const { selectedOperators } = storeToRefs(usePlannerStore());
</script>

<template>
    <PlannerSection title="Selected Operators" :initial-state="true" local-storage-id="selected-operators-collapsed">
        <div class="container">
            <div class="row mb-3 py-3 selected-operator" v-for="character in selectedOperators" :key="character.operator.id">
                <OperatorControls :operator-id="character.operator.id" />
            </div>
            <div class="row" v-if="selectedOperators.length === 0">
                <div class="col-12">
                    <p class="text-center">No Operators Selected</p>
                </div>
            </div>
        </div>
    </PlannerSection>
</template>

<style scoped>
.selected-operator {
    border-radius: 3px;
    background: #e6e6e6;
    color: rgb(0, 0, 0);
}
</style>