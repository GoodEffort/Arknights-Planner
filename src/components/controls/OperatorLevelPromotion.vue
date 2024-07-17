<script setup lang="ts">
import { computed, watch } from 'vue';
import type { SelectedOperator } from '../../types/operator';
import OperatorPromotion from './OperatorPromotion.vue';
import OperatorLevel from './OperatorLevel.vue';

const props = defineProps<{
    selectedOperator: SelectedOperator;
    type: 'current' | 'target';
}>();

const operator = computed(() => props.selectedOperator.operator);
const plansKey = computed(() => `${props.type}Elite` as 'currentElite' | 'targetElite');

const elite = computed({
    get: () => props.selectedOperator.plans[plansKey.value],
    set: value => {
        props.selectedOperator.plans.currentElite = (+value) as 0 | 1 | 2;
    }
});

const levelMax = computed(() => operator.value.phases[elite.value].maxLevel);

const level = computed({
    get: () => props.selectedOperator.plans.currentLevel,
    set: value => {
        let newLevel = +value;

        if (newLevel < 1) newLevel = 1;
        if (newLevel > levelMax.value) newLevel = levelMax.value;

        props.selectedOperator.plans.currentLevel = newLevel;
    }
});

watch(elite, () => {
    if (props.type === "current" && props.selectedOperator.plans.targetElite < elite.value) {
        props.selectedOperator.plans.targetElite = elite.value;
    }

    level.value = 1;
});

watch(level, () => {
    if (props.type === "current" && props.selectedOperator.plans.targetLevel < level.value) {
        props.selectedOperator.plans.targetLevel = level.value;
    }
});
</script>

<template>
    <hr />
    <div class="row">
        <div class="col-md-7 col-5" v-if="operator.phases.length > 1">
            <OperatorPromotion :phases="operator.phases" v-model="elite" :key="`1${operator.id}-elite`" />
        </div>
        <div class="col">
            <OperatorLevel :maxLevel="levelMax" v-model="level" :key="`1${operator.id}-level`" />
        </div>
    </div>
</template>