<script setup lang="ts">
import { computed, watch } from 'vue';
import OperatorInputGroup from './OperatorInputGroup.vue';
import { SelectedOperator } from '../../types/planner-types';

const props = defineProps<{
    selectedOperator: SelectedOperator;
    type: 'current' | 'target';
}>();

const operator = computed(() => props.selectedOperator.operator);
const plansKey = computed(() => `${props.type}SkillMasteries` as 'currentSkillMasteries' | 'targetSkillMasteries');

const masterySetFn = (skill: 1 | 2 | 3) => (value: number) => {
    let newMastery = +value;

    if (newMastery < 0) newMastery = 0;
    if (newMastery > 3) newMastery = 3;

    props.selectedOperator.plans[plansKey.value][`skill${skill}`] = newMastery;
};

const mastery1 = computed({
    get: () => props.selectedOperator.plans[plansKey.value].skill1,
    set: masterySetFn(1)
});

const mastery2 = computed({
    get: () => props.selectedOperator.plans[plansKey.value].skill2,
    set: masterySetFn(2)
});

const mastery3 = computed({
    get: () => props.selectedOperator.plans[plansKey.value].skill3,
    set: masterySetFn(3)
});

const min1 = computed(() => props.type === 'current' ? 0 : props.selectedOperator.plans.currentSkillMasteries.skill1);
const min2 = computed(() => props.type === 'current' ? 0 : props.selectedOperator.plans.currentSkillMasteries.skill2);
const min3 = computed(() => props.type === 'current' ? 0 : props.selectedOperator.plans.currentSkillMasteries.skill3);

watch(mastery1, val => {
    if (props.type === 'current' && props.selectedOperator.plans.targetSkillMasteries.skill1 < val) {
        props.selectedOperator.plans.targetSkillMasteries.skill1 = val;
    }
});

watch(mastery2, val => {
    if (props.type === 'current' && props.selectedOperator.plans.targetSkillMasteries.skill2 < val) {
        props.selectedOperator.plans.targetSkillMasteries.skill2 = val;
    }
});

watch(mastery3, val => {
    if (props.type === 'current' && props.selectedOperator.plans.targetSkillMasteries.skill3 < val) {
        props.selectedOperator.plans.targetSkillMasteries.skill3 = val;
    }
});
</script>

<template>
    <hr />

    <div class="row" v-if="operator.promotions.length > 2">
        <label>Masteries</label>
        <div class="col pe-0 px-md-auto">
            <OperatorInputGroup v-if="operator.skills.length > 0" v-model="mastery1" label="S1"
                :key="`2${operator.id}-skill1`" :min="min1" />
        </div>
        <div class="col px-1 px-md-auto">
            <OperatorInputGroup v-if="operator.skills.length > 1" v-model="mastery2" label="S2"
                :key="`2${operator.id}-skill2`" :min="min2" />
        </div>
        <div class="col ps-0 px-md-auto">
            <OperatorInputGroup v-if="operator.skills.length > 2" v-model="mastery3" label="S3"
                :key="`2${operator.id}-skill3`" :min="min3" />
        </div>
    </div>
</template>