<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { usePlannerStore } from '../store/planner-store';

import type Character from '../types/character';
import PlannerSection from './PlannerSection.vue';
import AddOperatorsCell from './AddOperatorsCell.vue';

const { loadCharacters } = usePlannerStore();
const { characters } = storeToRefs(usePlannerStore());

const pageCount = computed(() => Math.ceil(characters.value.length / pageSize.value));
const pagedCharacters = computed(() => {
    const pages = Array.from({ length: pageCount.value }, (_, index) => {
        const start = index * pageSize.value;
        return sortedCharacters.value.slice(start, start + pageSize.value);
    });
    return pages;
});

const selectedSort = ref<'Name' | 'Rarity' | 'Class'>('Name');
const operatorFilter = ref('');
const pageSize = ref(6); // make it divisible by 12 for bootstrap grids

const filteredCharacters = computed(() => characters.value.filter(character => character.name.toLowerCase().includes(operatorFilter.value.toLowerCase())));
const sortedCharacters = computed(() => filteredCharacters.value.sort(characterSort));


function sortByName(a: Character, b: Character) {
    return a.name.localeCompare(b.name);
}

function sortByRarity(a: Character, b: Character) {
    if (a.rarity === b.rarity)
        return a.name.localeCompare(b.name);
    else
        return b.rarity - a.rarity;
}

function sortByClass(a: Character, b: Character) {
    if (a.profession === b.profession)
        return sortByRarity(a, b);
    else
        return a.profession.localeCompare(b.profession);
}

function characterSort(a: Character, b: Character) {
    switch (selectedSort.value) {
        case 'Name':
            return sortByName(a, b);
        case 'Rarity':
            return sortByRarity(a, b);
        case 'Class':
            return sortByClass(a, b);
    }
}

onMounted(loadCharacters);
</script>

<template>
    <PlannerSection title="Add Operators">

        <input type="text" v-model="operatorFilter" placeholder="Filter by operator name" />

        <hr />

        <div class="container">
            <div class="row" v-for="(row, index) in pagedCharacters" :key="index">
                <AddOperatorsCell v-for="character in row" :character="character" :key="character.id" />
            </div>
        </div>
    </PlannerSection>
</template>