<script setup lang="ts">
import { computed, watch } from 'vue';
import { SelectedOperator } from '../../types/operator';
import OperatorInputGroup from './OperatorInputGroup.vue';

const props = defineProps<{
    selectedOperator: SelectedOperator;
    type: 'current' | 'target';
}>();

const hasXModule = computed(() => props.selectedOperator.operator.modules.find(m => m.type === 'X') !== undefined);
const hasYModule = computed(() => props.selectedOperator.operator.modules.find(m => m.type === 'Y') !== undefined);
const hasDModule = computed(() => props.selectedOperator.operator.modules.find(m => m.type === 'D') !== undefined);

const moduleX = computed({
    get: () => props.selectedOperator.plans[`${props.type}Modules`].x,
    set: value => props.selectedOperator.plans[`${props.type}Modules`].x = +value
});


const moduleY = computed({
    get: () => props.selectedOperator.plans[`${props.type}Modules`].y,
    set: value => props.selectedOperator.plans[`${props.type}Modules`].y = +value
});


const moduleD = computed({
    get: () => props.selectedOperator.plans[`${props.type}Modules`].d,
    set: value => props.selectedOperator.plans[`${props.type}Modules`].d = +value
});

const operatorId = computed(() => props.selectedOperator.operator.id);
const minX = computed(() => props.type === "current" ? 0 : props.selectedOperator.plans.currentModules.x);
const minY = computed(() => props.type === "current" ? 0 : props.selectedOperator.plans.currentModules.y);
const minD = computed(() => props.type === "current" ? 0 : props.selectedOperator.plans.currentModules.d);

watch(moduleX, () => {
    if (props.type === "current" && props.selectedOperator.plans.targetModules.x < moduleX.value) {
        props.selectedOperator.plans.targetModules.x = moduleX.value;
    }
});

watch(moduleY, () => {
    if (props.type === "current" && props.selectedOperator.plans.targetModules.y < moduleY.value) {
        props.selectedOperator.plans.targetModules.y = moduleY.value;
    }
});

watch(moduleD, () => {
    if (props.type === "current" && props.selectedOperator.plans.targetModules.d < moduleD.value) {
        props.selectedOperator.plans.targetModules.d = moduleD.value;
    }
});
</script>

<template>
    <hr />
    <div class="row" v-if="selectedOperator.operator.modules.length > 0">
        <label>Modules</label>
        <div class="col" v-if="hasXModule">
            <OperatorInputGroup v-model="moduleX" label="X" :key="`1${operatorId}-mx`" :min="minX" />
        </div>
        <div class="col" v-if="hasYModule">
            <OperatorInputGroup v-model="moduleY" label="Y" :key="`1${operatorId}-my`" :min="minY" />
        </div>
        <div class="col" v-if="hasDModule">
            <OperatorInputGroup v-model="moduleD" label="Δ" :key="`1${operatorId}-md`" :min="minD" />
        </div>
    </div>
</template>