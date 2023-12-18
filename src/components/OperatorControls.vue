<script setup lang="ts">
import { PropType, computed, watch } from 'vue';
import Character from '../types/character';
import { storeToRefs } from 'pinia';
import { usePlannerStore } from '../store/planner-store';
import { OperatorPlans } from '../types/plans';
import OperatorPromotion from './controls/OperatorPromotion.vue';
import OperatorLevel from './controls/OperatorLevel.vue';
import OperatorSkillLevel from './controls/OperatorSkillLevel.vue';
import OperatorSkillMasteries from './controls/OperatorMasteries.vue';

const { character } = defineProps({
    character: {
        type: Object as PropType<Character>,
        required: true
    }
});

const { getImageLink } = usePlannerStore();
const { plans } = storeToRefs(usePlannerStore());

const plan = computed<OperatorPlans>(() => plans.value[character.id]);

const currentElite = computed({
    get: () => plan.value.currentElite,
    set: value => plan.value.currentElite = +value
});

const targetElite = computed({
    get: () => plan.value.targetElite,
    set: value => plan.value.targetElite = +value
});

const currentLevel = computed({
    get: () => plan.value.currentLevel,
    set: value => plan.value.currentLevel = +value
});

const targetLevel = computed({
    get: () => plan.value.targetLevel,
    set: value => plan.value.targetLevel = +value
});

const currentSkill = computed({
    get: () => plan.value.currentSkillLevels,
    set: value => plan.value.currentSkillLevels = +value
});

const targetSkill = computed({
    get: () => plan.value.targetSkillLevels,
    set: value => plan.value.targetSkillLevels = +value
});

const currentMastery1 = computed({
    get: () => plan.value.targetSkillMasteries.skill1,
    set: value => plan.value.targetSkillMasteries.skill1 = +value
});

const currentMastery2 = computed({
    get: () => plan.value.targetSkillMasteries.skill1,
    set: value => plan.value.targetSkillMasteries.skill1 = +value
});

const currentMastery3 = computed({
    get: () => plan.value.targetSkillMasteries.skill1,
    set: value => plan.value.targetSkillMasteries.skill1 = +value
});

const targetMastery1 = computed({
    get: () => plan.value.targetSkillMasteries.skill1,
    set: value => plan.value.targetSkillMasteries.skill1 = +value
});

const targetMastery2 = computed({
    get: () => plan.value.targetSkillMasteries.skill1,
    set: value => plan.value.targetSkillMasteries.skill1 = +value
});

const targetMastery3 = computed({
    get: () => plan.value.targetSkillMasteries.skill1,
    set: value => plan.value.targetSkillMasteries.skill1 = +value
});

watch(currentElite, value => {
    if (value > plan.value.targetElite)
        targetElite.value = +value;
});

watch(currentLevel, value => {
    if (value > plan.value.targetLevel)
        targetLevel.value = +value;
});

</script>

<template>
    <div class="col-2">
        <img :src="getImageLink(character)" :alt="character.name" class="img-thumbnail" />
    </div>
    <div class="col-10">
        <div class="row">
            <h4>{{ character.name }}</h4>
        </div>
        <div class="row">
            <div class="col-6">
                <label>Current</label>
                <div>
                    <OperatorPromotion :phases="character.phases" v-model="currentElite" />
                </div>
                <div>
                    <OperatorLevel :maxLevel="character.phases[currentElite].maxLevel" v-model="currentLevel" />
                </div>
                <div v-if="character.skills.length > 0" >
                    <OperatorSkillLevel v-model="currentSkill" />
                </div>
                <div v-if="character.phases.length > 2">
                    <div v-if="character.skills.length > 0">
                        <OperatorSkillMasteries v-model="currentMastery1" :skillNumber="1" />
                    </div>
                    <div v-if="character.skills.length > 1">
                        <OperatorSkillMasteries v-model="currentMastery2" :skillNumber="2" />
                    </div>
                    <div v-if="character.skills.length > 2">
                        <OperatorSkillMasteries v-model="currentMastery3" :skillNumber="3" />
                    </div>
                </div>
            </div>
            <div class="col-6">
                <label>Planned</label>
                <div>
                    <OperatorPromotion :phases="character.phases" v-model="targetElite" />
                </div>
                <div>
                    <OperatorLevel :maxLevel="character.phases[targetElite].maxLevel" v-model="targetLevel" />
                </div>
                <div v-if="character.skills.length > 0" >
                    <OperatorSkillLevel v-model="targetSkill" />
                </div>
                <div v-if="character.phases.length > 2">
                    <div v-if="character.skills.length > 0">
                        <OperatorSkillMasteries v-model="targetMastery1" :skillNumber="1" />
                    </div>
                    <div v-if="character.skills.length > 1">
                        <OperatorSkillMasteries v-model="targetMastery2" :skillNumber="2" />
                    </div>
                    <div v-if="character.skills.length > 2">
                        <OperatorSkillMasteries v-model="targetMastery3" :skillNumber="3" />
                    </div>
                </div>
                
            </div>
        </div>
    </div>
</template>