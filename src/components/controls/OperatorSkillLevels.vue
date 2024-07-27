<script setup lang="ts">
import { computed, watch } from 'vue';
import type { SelectedOperator } from '../../types/planner-types';

const props = defineProps<{
    selectedOperator: SelectedOperator;
    type: 'current' | 'target';
}>();

const plans = computed(() => props.selectedOperator.plans);
const eliteKey = computed(() => `${props.type}Elite` as 'currentElite' | 'targetElite');
const skillsKey = computed(() => `${props.type}SkillLevels` as 'currentSkillLevels' | 'targetSkillLevels');

const maxSkill = computed(() => plans.value[eliteKey.value] === 0 ? 4 : 7);
const minSkill = computed(() => props.type === "current" ? 1 : props.selectedOperator.plans.currentSkillLevels);

const skillLevel = computed({
    get: () => plans.value[skillsKey.value],
    set: value => {
        let newSkill = +value;

        if (newSkill < minSkill.value) {
            newSkill = minSkill.value;
        }
        else if (newSkill > maxSkill.value) {
            newSkill = maxSkill.value;
        }

        plans.value[skillsKey.value] = newSkill;
    }
});

watch(skillLevel, () => {
    if (props.type === "current" && props.selectedOperator.plans.targetSkillLevels < skillLevel.value) {
        props.selectedOperator.plans.targetSkillLevels = skillLevel.value;
    }
});
</script>

<template>
    <hr />

    <div class="row">
        <div class="input-group">
            <span class="input-group-text">Skill Level</span>
            <input type="number" class="form-control" v-model="skillLevel" :min="minSkill" :max="maxSkill" />
        </div>
    </div>
</template>