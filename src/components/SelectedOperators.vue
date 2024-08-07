<script lang="ts" setup>
import PlannerSection from './PlannerSection.vue';
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import OperatorControls from './OperatorControls.vue';
import { computed, ref, watch } from 'vue';
import { localeCompare, localeContains, localeStartsWith } from '../data/operatorNameCompare';
import { SelectedOperator } from '../types/planner-types';

const { selectedOperators } = storeToRefs(usePlannerStore());
const { bringActiveToTop } = usePlannerStore();

const showInactive = ref((localStorage.getItem('showInactive') ?? 'true') === 'true');
const operatorFilter = ref('');
const sectionTitle = computed(() => 
    showInactive.value ? `Selected Operators (${selectedOperatorsSorted.value.length})` : 
    `Selected Operators (${selectedOperatorsSorted.value.length}/${ selectedOperators.value.length }) `);

const characterSort = (a: SelectedOperator, b: SelectedOperator) => a.sort - b.sort;
const characterNameSort = (a: SelectedOperator, b: SelectedOperator) => localeCompare(a.operator.name, b.operator.name);

const selectedOperatorsSorted = computed(() => {
    const ops = selectedOperators.value
        .filter(op => (showInactive.value || op.active));

    if (operatorFilter.value === '') {
        return ops.sort(characterSort);
    }

    const startsWith = ops.filter(character =>
        localeStartsWith(
            character.operator.name.toLowerCase(),
            operatorFilter.value.toLowerCase()
        )
    ).sort(characterNameSort);

    const contains = ops.filter(character =>
        !startsWith.includes(character) &&
        localeContains(
            character.operator.name.toLowerCase(),
            operatorFilter.value.toLowerCase()
        )
    ).sort(characterNameSort);

    return [...startsWith, ...contains];
});

watch(showInactive, () => localStorage.setItem('showInactive', showInactive.value.toString()));
</script>

<template>
    <PlannerSection :title="sectionTitle" :initial-state="true" local-storage-id="selected-operators-collapsed">
        <div class="container">
            <div class="row mb-2">
                <div class="col text-start">
                    <div class="input-group">
                        <input class="form-control" type="text" v-model="operatorFilter"
                            placeholder="Filter by operator name" />
                        <button class="btn btn-outline-secondary" @click="operatorFilter = ''">Clear</button>
                    </div>
                </div>
                <div class="col text-end">
                    <button class="btn btn-primary me-lg-2" @click="bringActiveToTop" v-if="showInactive">Sort by Active/Inactive and Name</button>
                    <button class="btn btn-primary" @click="showInactive = !showInactive">{{ showInactive ? 'Hide' :
                        'Show' }} Inactive Operators</button>
                </div>
            </div>
            <hr />
            <div class="row mb-3 py-3 selected-operator" v-for="character in selectedOperatorsSorted"
                :key="character.operator.id">
                <OperatorControls :selected-operator="character" :sorted-list="selectedOperatorsSorted" :enable-move="operatorFilter === ''"/>
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

html.dark>body .selected-operator {
    background-color: #000000;
    border: 1px solid #3d3d3d;
    color: #fff;
}

html.dark>body .selected-operator:hover {
    background-color: #1a1a1a;
    border: 1px solid #666666;
    color: #fff;
}

html.dark>body .selected-operator {
    background-color: #000000;
    border: 1px solid #3d3d3d;
    color: #fff;
}

html.dark>body .selected-operator:hover {
    background-color: #1a1a1a;
    border: 1px solid #666666;
    color: #fff;
}
</style>