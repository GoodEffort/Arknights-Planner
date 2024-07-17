<script setup lang="ts">
import { computed, watch } from 'vue';
import type { SelectedOperator } from '../../types/operator';

const props = defineProps<{
    selectedOperator: SelectedOperator;
    type: 'current' | 'target';
}>();

const plans = computed(() => props.selectedOperator.plans);
const eliteKey = computed(() => `${props.type}Elite` as 'currentElite' | 'targetElite');
const skillsKey = computed(() => `${props.type}SkillLevels` as 'currentSkillLevels' | 'targetSkillLevels');

const maxSkill = computed(() => plans.value[eliteKey.value] === 0 ? 4 : 7);

const skillLevel = computed({
    get: () => plans.value[skillsKey.value],
    set: value => {
        let newSkill = +value;

        if (newSkill < 1) {
            newSkill = 1;
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
            <input type="number" class="form-control" v-model="skillLevel" min="1" :max="maxSkill" />
        </div>
    </div>
</template>