<script setup lang="ts">
import { PropType, computed, watch } from 'vue';
import { usePlannerStore } from '../store/planner-store';
import OperatorPromotion from './controls/OperatorPromotion.vue';
import OperatorLevel from './controls/OperatorLevel.vue';
import OperatorSkillLevel from './controls/OperatorSkillLevel.vue';
import OperatorSkillMasteries from './controls/OperatorMasteries.vue';
import type { Operator } from '../types/operator';
import { SelectedOperator } from '../types/operator';
import OperatorModule from './controls/OperatorModule.vue';
import { elite1Costs, elite2Costs, elite0Costs } from '../data/leveling-costs';

const levelingCostsArray = [elite0Costs, elite1Costs, elite2Costs];

const { selectedOperator } = defineProps({
    selectedOperator: {
        type: Object as PropType<SelectedOperator>,
        required: true
    }
});

const { getImageLink } = usePlannerStore();

const operator = computed<Operator>(() => selectedOperator.operator);

const currentElite = computed({
    get: () => selectedOperator.plans.currentElite,
    set: value => selectedOperator.plans.currentElite = (+value) as 0 | 1 | 2
});

const targetElite = computed({
    get: () => selectedOperator.plans.targetElite,
    set: value => selectedOperator.plans.targetElite = (+value) as 0 | 1 | 2
});

const currentLevel = computed({
    get: () => selectedOperator.plans.currentLevel,
    set: value => selectedOperator.plans.currentLevel = +value
});

const targetLevel = computed({
    get: () => selectedOperator.plans.targetLevel,
    set: value => selectedOperator.plans.targetLevel = +value
});

const currentSkill = computed({
    get: () => selectedOperator.plans.currentSkillLevels,
    set: value => selectedOperator.plans.currentSkillLevels = +value
});

const targetSkill = computed({
    get: () => selectedOperator.plans.targetSkillLevels,
    set: value => selectedOperator.plans.targetSkillLevels = +value
});

const currentMastery1 = computed({
    get: () => selectedOperator.plans.currentSkillMasteries.skill1,
    set: value => selectedOperator.plans.currentSkillMasteries.skill1 = +value
});

const currentMastery2 = computed({
    get: () => selectedOperator.plans.currentSkillMasteries.skill2,
    set: value => selectedOperator.plans.currentSkillMasteries.skill2 = +value
});

const currentMastery3 = computed({
    get: () => selectedOperator.plans.currentSkillMasteries.skill3,
    set: value => selectedOperator.plans.currentSkillMasteries.skill3 = +value
});

const targetMastery1 = computed({
    get: () => selectedOperator.plans.targetSkillMasteries.skill1,
    set: value => selectedOperator.plans.targetSkillMasteries.skill1 = +value
});

const targetMastery2 = computed({
    get: () => selectedOperator.plans.targetSkillMasteries.skill2,
    set: value => selectedOperator.plans.targetSkillMasteries.skill2 = +value
});

const targetMastery3 = computed({
    get: () => selectedOperator.plans.targetSkillMasteries.skill3,
    set: value => selectedOperator.plans.targetSkillMasteries.skill3 = +value
});

const hasXModule = computed(() => selectedOperator.modules.find(m => m.typeName2 === 'X') !== undefined);
const hasYModule = computed(() => selectedOperator.modules.find(m => m.typeName2 === 'Y') !== undefined);
const hasZModule = computed(() => selectedOperator.modules.find(m => m.typeName2 === 'Z') !== undefined);

const currentModuleX = computed({
    get: () => selectedOperator.plans.currentModules.x,
    set: value => selectedOperator.plans.currentModules.x = +value
});

const currentModuleY = computed({
    get: () => selectedOperator.plans.currentModules.y,
    set: value => selectedOperator.plans.currentModules.y = +value
});

const currentModuleZ = computed({
    get: () => selectedOperator.plans.currentModules.z,
    set: value => selectedOperator.plans.currentModules.z = +value
});

const targetModuleX = computed({
    get: () => selectedOperator.plans.targetModules.x,
    set: value => selectedOperator.plans.targetModules.x = +value
});

const targetModuleY = computed({
    get: () => selectedOperator.plans.targetModules.y,
    set: value => selectedOperator.plans.targetModules.y = +value
});

const targetModuleZ = computed({
    get: () => selectedOperator.plans.targetModules.z,
    set: value => selectedOperator.plans.targetModules.z = +value
});

watch(currentElite, value => {
    if (value > selectedOperator.plans.targetElite)
        targetElite.value = (+value) as 0 | 1 | 2;
});

watch(currentLevel, value => {
    if (value > selectedOperator.plans.targetLevel)
        targetLevel.value = +value;
});

watch(currentSkill, value => {
    if (value > selectedOperator.plans.targetSkillLevels)
        targetSkill.value = +value;
});

watch(currentMastery1, value => {
    if (value > selectedOperator.plans.targetSkillMasteries.skill1)
        targetMastery1.value = +value;
});

watch(currentMastery2, value => {
    if (value > selectedOperator.plans.targetSkillMasteries.skill2)
        targetMastery2.value = +value;
});

watch(currentMastery3, value => {
    if (value > selectedOperator.plans.targetSkillMasteries.skill3)
        targetMastery3.value = +value;
});

const levelingCosts = computed(() => {
    const currentLevel = selectedOperator.plans.currentLevel;
    const targetLevel = selectedOperator.plans.targetLevel;
    let currentEliteIndex: number = selectedOperator.plans.currentElite;
    const targetEliteIndex: number = selectedOperator.plans.targetElite;

    let lmd = 0;
    let exp = 0;

    let currentLevelIndex = levelingCostsArray[currentEliteIndex].findIndex(c => c.level === currentLevel);

    for (; currentEliteIndex <= targetEliteIndex; currentEliteIndex++) {
        const { maxLevel } = operator.value.phases[currentEliteIndex];
        const maxLevelIndex = levelingCostsArray[currentEliteIndex].findIndex(c => c.level === (currentEliteIndex < targetEliteIndex ? maxLevel: targetLevel));

        for (; currentLevelIndex <= maxLevelIndex; currentLevelIndex++) {
            lmd += levelingCostsArray[currentEliteIndex][currentLevelIndex].lmd;
            exp += levelingCostsArray[currentEliteIndex][currentLevelIndex].exp;
        }
        
        currentLevelIndex = 0;
    }

    return { lmd, exp };
});

</script>

<template>
    <div class="col-2 center-vert">
        <img :src="getImageLink(operator)" :alt="operator.name" class="img-thumbnail" />
    </div>
    <div class="col-10 left-border">
        <div class="row">
            <h4>{{ operator.name }}</h4>
        </div>
        <div class="row">
            <div class="col-6">
                <label>Current</label>
                <hr />

                <div class="row">
                    <div class="col-7" v-if="operator.phases.length > 1">
                        <OperatorPromotion :phases="operator.phases" v-model="currentElite" />
                    </div>
                    <div class="col">
                        <OperatorLevel :maxLevel="operator.phases[currentElite].maxLevel" v-model="currentLevel" />
                    </div>
                </div>
                <hr v-if="operator.skills.length > 0" />

                <div class="row" v-if="operator.skills.length > 0">
                    <OperatorSkillLevel v-model="currentSkill" />
                </div>
                <hr v-if="operator.phases.length > 2" />

                <div class="row" v-if="operator.phases.length > 2">
                    <label>Skill Masteries</label>
                    <div class="col">
                        <OperatorSkillMasteries v-if="operator.skills.length > 0" v-model="currentMastery1" :skillNumber="1" />
                    </div>
                    <div class="col">
                        <OperatorSkillMasteries v-if="operator.skills.length > 1" v-model="currentMastery2" :skillNumber="2" />
                    </div>
                    <div class="col">
                        <OperatorSkillMasteries v-if="operator.skills.length > 2" v-model="currentMastery3" :skillNumber="3" />
                    </div>
                </div>
                <hr v-if="selectedOperator.modules.length > 0" />

                <div class="row" v-if="selectedOperator.modules.length > 0">
                    <label>Modules</label>
                    <div class="col">
                        <OperatorModule v-if="hasXModule" v-model="currentModuleX" module-letter="X" />
                    </div>
                    <div class="col">
                        <OperatorModule v-if="hasYModule" v-model="currentModuleY" module-letter="Y" />
                    </div>
                    <div class="col">
                        <OperatorModule v-if="hasZModule" v-model="currentModuleZ" module-letter="Z" />
                    </div>
                </div>

            </div>
            <div class="col-6">
                <label>Planned</label>
                <hr />

                <div class="row">
                    <div class="col-7" v-if="operator.phases.length > 1">
                        <OperatorPromotion :phases="operator.phases" v-model="targetElite" />
                    </div>
                    <div class="col">
                        <OperatorLevel :maxLevel="operator.phases[targetElite].maxLevel" v-model="targetLevel" />
                    </div>
                </div>
                <hr v-if="operator.skills.length > 0" />

                <div class="row" v-if="operator.skills.length > 0">
                    <OperatorSkillLevel v-model="targetSkill" />
                </div>
                <hr v-if="operator.phases.length > 2" />

                <div class="row" v-if="operator.phases.length > 2">
                    <label>Skill Masteries</label>
                    <div class="col">
                        <OperatorSkillMasteries v-if="operator.skills.length > 0" v-model="targetMastery1" :skillNumber="1" />
                    </div>
                    <div class="col">
                        <OperatorSkillMasteries v-if="operator.skills.length > 1" v-model="targetMastery2" :skillNumber="2" />
                    </div>
                    <div class="col">
                        <OperatorSkillMasteries v-if="operator.skills.length > 2" v-model="targetMastery3" :skillNumber="3" />
                    </div>
                </div>
                <hr v-if="selectedOperator.modules.length > 0" />

                <div class="row" v-if="selectedOperator.modules.length > 0">
                    <label>Modules</label>
                    <div class="col">
                        <OperatorModule v-if="hasXModule" v-model="targetModuleX" module-letter="X" />
                    </div>
                    <div class="col">
                        <OperatorModule v-if="hasYModule" v-model="targetModuleY" module-letter="Y" />
                    </div>
                    <div class="col">
                        <OperatorModule v-if="hasZModule" v-model="targetModuleZ" module-letter="Z" />
                    </div>
                </div>
            </div>
            <div class="col-12">
                <hr />
            </div>
        </div>
        <div class="row">
            <div class="col">
                LMD {{ levelingCosts.lmd }}
                EXP {{ levelingCosts.exp }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.center-vert {
    margin-top:auto;
    margin-bottom:auto;
}

.left-border {
    border-left: 1px rgba(255, 255, 255, 0.25) solid;
}
</style>