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
const eliteKey = computed(() => `${props.type}Elite` as 'currentElite' | 'targetElite');
const levelKey = computed(() => `${props.type}Level` as 'currentLevel' | 'targetLevel');

const elite = computed({
    get: () => props.selectedOperator.plans[eliteKey.value],
    set: value => {
        props.selectedOperator.plans[eliteKey.value] = +value as 0 | 1 | 2;
    }
});

const levelMax = computed(() => operator.value.promotions[elite.value].maxLevel);
const levelMin = computed(() => props.type === "current" ? 1 : props.selectedOperator.plans.currentLevel);

const level = computed({
    get: () => props.selectedOperator.plans[levelKey.value],
    set: value => {
        let newLevel = +value;

        if (newLevel < levelMin.value) newLevel = levelMin.value;
        else if (newLevel > levelMax.value) newLevel = levelMax.value;

        props.selectedOperator.plans[levelKey.value] = newLevel;
    }
});

watch(elite, () => {
    if (props.type === "current" && props.selectedOperator.plans.targetElite < elite.value) {
        props.selectedOperator.plans.targetElite = elite.value;
    }
    else if (props.type === "target" && props.selectedOperator.plans.currentElite > elite.value) {
        props.selectedOperator.plans.currentElite = elite.value;
    }

    level.value = 1;
});

watch(level, () => {
    if (
        props.type === "current" &&
        props.selectedOperator.plans.currentElite === props.selectedOperator.plans.targetElite && 
        props.selectedOperator.plans.targetLevel < level.value
    ) {
        props.selectedOperator.plans.targetLevel = level.value;
    }
});
</script>

<template>
    <hr />
    <div class="row">
        <div class="col-md-7 col-5" v-if="operator.promotions.length > 1">
            <OperatorPromotion :promotions="operator.promotions" v-model="elite" :key="`1${operator.id}-elite`" />
        </div>
        <div class="col">
            <OperatorLevel :maxLevel="levelMax" :minLevel="levelMin" v-model="level" :key="`1${operator.id}-level`" />
        </div>
    </div>
</template>