<script lang="ts" setup>
import PlannerSection from './PlannerSection.vue';
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import OperatorControls from './OperatorControls.vue';
import { computed } from 'vue';
import ItemCell from './ItemCell.vue';

const { selectedOperators, totalCosts, items } = storeToRefs(usePlannerStore());

const totalCostsArray = computed(() => {
    const costsDict = totalCosts.value ?? [];
    const costs = Object.keys(costsDict).map(key => {
        const item = items.value[key];
        const count = costsDict[key];
        return { item, count };
    });
    return costs
        .filter(cost => cost.count > 0)
        .sort((a, b) => a.item.sortId - b.item.sortId);
});
</script>

<template>
    <PlannerSection title="Selected Operators" :initial-state="true">
        <div class="container">
            <div class="row mb-3 py-3" v-for="character in selectedOperators" :key="character.operator.id">
                <OperatorControls :operator-id="character.operator.id" />
            </div>
            <div class="row" v-if="selectedOperators.length === 0">
                <div class="col-12">
                    <p class="text-center">No Operators Selected</p>
                </div>
            </div>
            <div class="row py-3" v-if="totalCostsArray.length > 0">
                <ItemCell v-for="{ item, count } in totalCostsArray" :item="item" :count="count" />
            </div>
            <div class="row py-3" v-else>
                <div class="col-12">
                    <p class="text-center">No Materials Required</p>
                </div>
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