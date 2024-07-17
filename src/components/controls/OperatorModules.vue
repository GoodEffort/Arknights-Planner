<script setup lang="ts">
import { computed, watch } from 'vue';
import { SelectedOperator } from '../../types/operator';
import OperatorModule from './OperatorModule.vue';

const props = defineProps<{
    selectedOperator: SelectedOperator;
    type: 'current' | 'target';
}>();

const hasXModule = computed(() => props.selectedOperator.modules.find(m => m.typeName2 === 'X') !== undefined);
const hasYModule = computed(() => props.selectedOperator.modules.find(m => m.typeName2 === 'Y') !== undefined);
const hasDModule = computed(() => props.selectedOperator.modules.find(m => m.typeName2 === 'D') !== undefined);

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
    <div class="row" v-if="selectedOperator.modules.length > 0">
        <label>Modules</label>
        <div class="col" v-if="hasXModule">
            <OperatorModule v-model="moduleX" module-letter="X" :key="`1${operatorId}-mx`" />
        </div>
        <div class="col" v-if="hasYModule">
            <OperatorModule v-model="moduleY" module-letter="Y" :key="`1${operatorId}-my`" />
        </div>
        <div class="col" v-if="hasDModule">
            <OperatorModule v-model="moduleD" module-letter="Δ" :key="`1${operatorId}-md`" />
        </div>
    </div>
</template>