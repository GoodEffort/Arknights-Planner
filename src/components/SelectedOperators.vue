<script lang="ts" setup>
import PlannerSection from './PlannerSection.vue';
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import OperatorControls from './OperatorControls.vue';
import { computed } from 'vue';

const { selectedOperators } = storeToRefs(usePlannerStore());

const selectedOperatorsSorted = computed(() => selectedOperators.value.sort((a, b) => a.operator.name.localeCompare(b.operator.name)));
</script>

<template>
    <PlannerSection :title="`Selected Operators (${ selectedOperators.length })`" :initial-state="true" local-storage-id="selected-operators-collapsed">
        <div class="container">
            <div class="row mb-3 py-3 selected-operator" v-for="character in selectedOperatorsSorted" :key="character.operator.id">
                <OperatorControls :selected-operator="character" />
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