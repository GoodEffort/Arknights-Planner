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
    @media screen and (max-width: 768px) {
        padding-left: .5em;   
        padding-right: 0px;
    }
}

html.dark > body .selected-operator {
    background-color: #000000;
    border: 1px solid #3d3d3d;
    color: #fff;
}

html.dark > body .selected-operator:hover {
    background-color: #1a1a1a;
    border: 1px solid #666666;
    color: #fff;
}

html.dark > body .selected-operator {
    background-color: #000000;
    border: 1px solid #3d3d3d;
    color: #fff;
}

html.dark > body .selected-operator:hover {
    background-color: #1a1a1a;
    border: 1px solid #666666;
    color: #fff;
}
</style>