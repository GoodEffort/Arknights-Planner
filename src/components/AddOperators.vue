<script lang="ts" setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { usePlannerStore } from '../store/planner-store';

import type { Operator } from '../types/operator';
import PlannerSection from './PlannerSection.vue';
import AddOperatorsCell from './AddOperatorsCell.vue';

const { operators } = storeToRefs(usePlannerStore());

const pageCount = computed(() => Math.ceil(operators.value.length / pageSize.value));

const selectedSort = ref<'Name' | 'Rarity' | 'Class'>('Name');
const operatorFilter = ref('');
const pageSize = ref(6); // make it divisible by 12 for bootstrap grids

const filteredCharacters = computed(() => operators.value.filter(character => character.name.toLowerCase().includes(operatorFilter.value.toLowerCase())));
const sortedCharacters = computed(() => filteredCharacters.value.sort(characterSort));

const pagedOperators = computed(() => {
    const pages = Array.from({ length: pageCount.value }, (_, index) => {
        const start = index * pageSize.value;
        return sortedCharacters.value.slice(start, start + pageSize.value);
    });
    return pages;
});

function sortByName(a: Operator, b: Operator) {
    return a.name.localeCompare(b.name);
}

function sortByRarity(a: Operator, b: Operator) {
    if (a.rarity === b.rarity)
        return a.name.localeCompare(b.name);
    else
        return a.rarity.localeCompare(b.rarity);
}

function sortByClass(a: Operator, b: Operator) {
    if (a.profession === b.profession)
        return sortByRarity(a, b);
    else
        return a.profession.localeCompare(b.profession);
}

function characterSort(a: Operator, b: Operator) {
    switch (selectedSort.value) {
        case 'Name':
            return sortByName(a, b);
        case 'Rarity':
            return sortByRarity(a, b);
        case 'Class':
            return sortByClass(a, b);
    }
}
</script>

<template>
    <PlannerSection title="Add/Remove Operators" local-storage-id="add-operators-collapsed">

        <input class="form-control" type="text" v-model="operatorFilter" placeholder="Filter by operator name" />
        <hr />

        <div v-if="filteredCharacters.length > 36" class="mb-3">
            Filter more to display different operators, currently showing 36 of {{ filteredCharacters.length }} operators
        </div>

        <div class="container">
            <div class="row" v-for="(row, index) in pagedOperators.slice(0, 6)" :key="index">
                <AddOperatorsCell v-for="operator in row" :operator="operator" :key="operator.id" />
            </div>
        </div>
    </PlannerSection>
</template>

<style lang="css">
html.dark input.form-control::placeholder {
    color: #c5c5c5;
}
</style>