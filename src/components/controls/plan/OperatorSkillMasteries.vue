<script setup lang="ts">
import { computed, ref } from 'vue';
import OperatorInputGroup from '@/components/controls/plan/OperatorInputGroup.vue';
import { SelectedOperator } from '@/types/planner-types';

const props = defineProps<{
    selectedOperator: SelectedOperator;
    type: 'current' | 'target';
}>();

const imageErrors = ref<number[]>([]);

const operator = computed(() => props.selectedOperator.operator);
const plansKey = computed(() => `${props.type}SkillMasteries` as 'currentSkillMasteries' | 'targetSkillMasteries');

const getSkillKey = (skill: number): 'skill1' | 'skill2' | 'skill3' => {
    if (skill !== 1 && skill !== 2 && skill !== 3) {
        throw new Error('Invalid skill number');
    }
    return `skill${skill}`
}

const masterySetFn = (skill: number, value: number) => {
    const skillKey = getSkillKey(skill);
    let newMastery = +value;

    if (newMastery < 0) newMastery = 0;
    if (newMastery > 3) newMastery = 3;

    props.selectedOperator.plans[plansKey.value][skillKey] = newMastery;

    if (props.type === 'current' && props.selectedOperator.plans.targetSkillMasteries[skillKey] < newMastery) {
        props.selectedOperator.plans.targetSkillMasteries[skillKey] = newMastery;
    }
};

const masteries = computed(() => operator.value.skills.map((_, index) => props.selectedOperator.plans[plansKey.value][getSkillKey(index + 1)]));

const mins = computed(() => operator.value.skills.map((_, index) => {
    if (props.type === 'current') {
        return 0;
    }
    else {
        return props.selectedOperator.plans.currentSkillMasteries[getSkillKey(index + 1)];
    }
}));
</script>

<template>
    <hr />

    <div class="row" v-if="operator.skills.length > 0">
        <div class="row">
            <h5>{{ type === 'current' ? 'Current' : 'Target' }} Skill Masteries</h5>
        </div>
        <div class="row" :class="{ 'mb-2': index !== operator.skills.length - 1 }"
            v-for="(skill, index) in operator.skills">
            <div class="col-auto" v-if="!imageErrors.includes(index)">
                <img :src="`https://goodeffort.github.io/Arknights-Planner-Data/images/skills/${skill.id}.webp`"
                    :alt="skill.name" class="img-thumbnail skill-img" @error="imageErrors.push(index)" />
            </div>
            <div class="col text-start">
                <div>{{ skill.name }}</div>
                <div class="skill-input">
                    <OperatorInputGroup :model-value="masteries[index]"
                        @update:model-value="value => masterySetFn(index + 1, value ?? 0)"
                        :label="`S${index + 1}`" :key="`2${operator.id}-skill${index + 1}`" :min="mins[index]" />
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