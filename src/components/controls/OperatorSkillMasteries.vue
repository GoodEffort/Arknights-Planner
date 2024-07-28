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
        <div class="row">
            <h5>{{ type === 'current' ? 'Current' : 'Target' }} Skill Masteries</h5>
        </div>
        <div class="row mb-2">
            <div class="col-auto">
                <img :src="`https://goodeffort.github.io/Arknights-Planner-Data/images/skills/${ operator.skills[0].icon }.webp`"
                    :alt="operator.skills[0]?.name" class="img-thumbnail skill-img" />
            </div>
            <div class="col text-start">
                <div>{{ operator.skills[0]?.name }}</div>
                <div class="skill-input">
                    <OperatorInputGroup v-model="mastery1" label="S1"
                        :key="`2${operator.id}-skill1`" :min="min1" />
                </div>
            </div>
        </div>
        <div class="row mb-2" v-if="operator.skills.length > 1">
            <div class="col-auto">
                <img :src="`https://goodeffort.github.io/Arknights-Planner-Data/images/skills/${ operator.skills[1].icon }.webp`"
                    :alt="operator.skills[1]?.name" class="img-thumbnail skill-img" />
            </div>
            <div class="col text-start">
                <div>{{ operator.skills[1]?.name }}</div>
                <div class="skill-input">
                    <OperatorInputGroup v-model="mastery2" label="S2"
                        :key="`2${operator.id}-skill2`" :min="min2" />
                </div>
            </div>
        </div>
        <div class="row" v-if="operator.skills.length > 2">
            <div class="col-auto">
                <img :src="`https://goodeffort.github.io/Arknights-Planner-Data/images/skills/${ operator.skills[2].icon }.webp`"
                    :alt="operator.skills[2]?.name" class="img-thumbnail skill-img" />
            </div>
            <div class="col text-start">
                <div>{{ operator.skills[2]?.name }}</div>
                <div class="skill-input">
                    <OperatorInputGroup v-model="mastery3" label="S3"
                        :key="`2${operator.id}-skill3`" :min="min3" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.skill-img {
    width: 4em;
}
</style>