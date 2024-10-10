<script lang="ts" setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { usePlannerStore } from '@/store/planner-store';

import type { Operator } from '@/types/outputdata';
import PlannerSection from '@/components/akplanner/PlannerSection.vue';
import AddOperatorsCell from '@/components/akplanner/AddOperatorsCell.vue';
import { localeContains, localeStartsWith } from '@/data/operatorNameCompare';

const { operators, selectedOperators } = storeToRefs(usePlannerStore());

const pageCount = computed(() => Math.ceil(operators.value.length / pageSize.value));

const selectedSort = ref<'Name' | 'Rarity' | 'Class'>('Name');
const operatorFilter = ref('');
const pageSize = ref(6); // make it divisible by 12 for bootstrap grids
const showAll = ref(false);
const showSelected = ref(true);

const filteredCharacters = computed(() => {
    const ops = operators.value.filter(op => showSelected.value || !selectedOperators.value.find(c => c.operator.id === op.id));

    const startsWith = ops.filter(character =>
        localeStartsWith(
            character.name.toLowerCase(),
            operatorFilter.value.toLowerCase()
        )
    ).sort(characterSort);

    const contains = ops.filter(character =>
        !startsWith.includes(character) &&
        localeContains(
            character.name.toLowerCase(),
            operatorFilter.value.toLowerCase()
        )
    )

    return [...startsWith, ...contains];
});

const pagedOperators = computed(() => {
    const pages = Array.from({ length: pageCount.value }, (_, index) => {
        const start = index * pageSize.value;
        return filteredCharacters.value.slice(start, start + pageSize.value);
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
            <div class="btn-group">
                <button @click="showAll = !showAll" class="btn btn-primary">{{ showAll ? 'Limit Selection' : 'Show All'
                    }}</button>
                <button @click="showSelected = !showSelected" class="btn btn-primary">{{ showSelected ? 'Show Unselected Only' : 'Show Selected and Unselected' }}</button>
            </div>
            <p v-if="!showAll" class="mt-2">
                Filter more to display different operators, currently showing 36 of {{ filteredCharacters.length }}
                operators
            </p>
            <p v-else class="mt-2">
                &nbsp;
            </p>
        </div>

        <div class="container">
            <div class="row" v-for="(row, index) in (showAll ? pagedOperators : pagedOperators.slice(0, 6))"
                :key="index">
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