<script setup lang="ts">
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import ItemCell from './ItemCell.vue';
import { computed } from 'vue';

const { totalCostsByOperator, items } = storeToRefs(usePlannerStore());

const props = defineProps<{
    operatorId: string;
}>();

const totalCosts = computed(() => {
    const costsDict = totalCostsByOperator.value[props.operatorId] ?? [];
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
    <div class="row" v-if="totalCosts.length > 0">
        <ItemCell v-for="{ item, count } in totalCosts" :item="item" :count="count" />
    </div>
    <div class="row" v-else>
        <div class="col-12">
            <p class="text-center">No Materials Required</p>
        </div>
    </div>
</template>