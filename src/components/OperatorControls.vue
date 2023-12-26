<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { usePlannerStore } from '../store/planner-store';
import OperatorPromotion from './controls/OperatorPromotion.vue';
import OperatorLevel from './controls/OperatorLevel.vue';
import OperatorSkillMasteries from './controls/OperatorMasteries.vue';
import type { Operator, SaveRecord } from '../types/operator';
import OperatorModule from './controls/OperatorModule.vue';
import OperatorCosts from './OperatorCosts.vue';
import { Collapse } from 'vue-collapsed';
import { storeToRefs } from 'pinia';

const props = defineProps<{
    operatorId: string;
}>();

const { getOperatorImageLink } = usePlannerStore();
const { selectedOperators } = storeToRefs(usePlannerStore());

const selectedOperator = computed(() => selectedOperators.value.find(o => o.operator.id === props.operatorId)!);

watch(selectedOperator, ({ operator, plans }) => {
    const saveString = `plans-${ operator.id }`;
    const saveRecord: SaveRecord = {
        operatorId: operator.id,
        plans
    };
    localStorage.setItem(saveString, JSON.stringify(saveRecord));
}, { deep: true });

const collapsed = ref(false);

const operator = computed<Operator>(() => selectedOperator.value.operator);

const currentElite = computed({
    get: () => selectedOperator.value.plans.currentElite,
    set: value => {
        const elite: 0 | 1 | 2 = (+value) as 0 | 1 | 2

        if (elite > targetElite.value) {
            targetElite.value = elite;
        }

        selectedOperator.value.plans.currentElite = elite;
    }
});

const targetElite = computed({
    get: () => selectedOperator.value.plans.targetElite,
    set: value => {
        const elite: 0 | 1 | 2 = (+value) as 0 | 1 | 2

        if (elite < currentElite.value) {
            currentElite.value = elite;
        }

        selectedOperator.value.plans.targetElite = elite;
    }
});

const targetLevelMax = computed(() => {
    const phases = operator.value.phases;
    const te = targetElite.value;
    
    const maxLevel = phases[te].maxLevel;
    return maxLevel;
});

const currentLevelMax = computed(() => {
    const phases = operator.value.phases;
    const ce = currentElite.value;

    const maxLevel = phases[ce].maxLevel;
    return maxLevel;
});

const currentLevel = computed({
    get: () => selectedOperator.value.plans.currentLevel,
    set: value => {
        let newLevel = +value;

        if (newLevel < 1) newLevel = 1;
        if (newLevel > currentLevelMax.value) newLevel = currentLevelMax.value;

        if (newLevel > targetLevel.value && targetElite.value === currentElite.value) {
            targetLevel.value = newLevel;
        }

        selectedOperator.value.plans.currentLevel = newLevel;
    }
});

const targetLevel = computed({
    get: () => selectedOperator.value.plans.targetLevel,
    set: value => {
        let newLevel = +value;

        if (newLevel < 1) newLevel = 1;
        if (newLevel > targetLevelMax.value) newLevel = targetLevelMax.value;

        if (newLevel < currentLevel.value && targetElite.value === currentElite.value) {
            currentLevel.value = newLevel;
        }

        selectedOperator.value.plans.targetLevel = newLevel;
    }
});

const currentSkill = computed({
    get: () => selectedOperator.value.plans.currentSkillLevels,
    set: value => {
        let newSkill = +value;
        const maxSkill = currentElite.value === 0 ? 4 : 7;

        if (newSkill < 1) newSkill = 1;
        if (newSkill > maxSkill) newSkill = maxSkill;

        if (newSkill > targetSkill.value) {
            targetSkill.value = newSkill;
        }

        selectedOperator.value.plans.currentSkillLevels = newSkill;
    }
});

const targetSkill = computed({
    get: () => selectedOperator.value.plans.targetSkillLevels,
    set: value => {
        let newSkill = +value;
        const maxSkill = targetElite.value === 0 ? 4 : 7;

        if (newSkill < currentSkill.value) newSkill = currentSkill.value;
        if (newSkill > maxSkill) newSkill = maxSkill;

        selectedOperator.value.plans.targetSkillLevels = newSkill;
    }
});

const targetMasterySetFn = (skill: 1 | 2 | 3) => (value: number) => {
    let newMastery = +value;

    if (newMastery < 0) newMastery = 0;
    if (newMastery > 3) newMastery = 3;

    selectedOperator.value.plans.targetSkillMasteries[`skill${skill}`] = newMastery;
};

const targetMastery1 = computed({
    get: () => selectedOperator.value.plans.targetSkillMasteries.skill1,
    set: targetMasterySetFn(1)
});

const targetMastery2 = computed({
    get: () => selectedOperator.value.plans.targetSkillMasteries.skill2,
    set: targetMasterySetFn(2)
});

const targetMastery3 = computed({
    get: () => selectedOperator.value.plans.targetSkillMasteries.skill3,
    set: targetMasterySetFn(3)
});

const currentMasterySetFn = (skill: 1 | 2 | 3) => (value: number) => {
    let newMastery = +value;

    if (newMastery < 0) newMastery = 0;
    if (newMastery > 3) newMastery = 3;

    const target = skill === 1 ? targetMastery1 : skill === 2 ? targetMastery2 : targetMastery3;

    if (newMastery > target.value) {
        target.value = newMastery;
    }

    selectedOperator.value.plans.currentSkillMasteries[`skill${skill}`] = newMastery;
};

const currentMastery1 = computed({
    get: () => selectedOperator.value.plans.currentSkillMasteries.skill1,
    set: currentMasterySetFn(1)
});

const currentMastery2 = computed({
    get: () => selectedOperator.value.plans.currentSkillMasteries.skill2,
    set: currentMasterySetFn(2)
});

const currentMastery3 = computed({
    get: () => selectedOperator.value.plans.currentSkillMasteries.skill3,
    set: currentMasterySetFn(3)
});

const hasXModule = computed(() => selectedOperator.value.modules.find(m => m.typeName2 === 'X') !== undefined);
const hasYModule = computed(() => selectedOperator.value.modules.find(m => m.typeName2 === 'Y') !== undefined);
const hasZModule = computed(() => selectedOperator.value.modules.find(m => m.typeName2 === 'Z') !== undefined);

const currentModuleX = computed({
    get: () => selectedOperator.value.plans.currentModules.x,
    set: value => selectedOperator.value.plans.currentModules.x = +value
});

const currentModuleY = computed({
    get: () => selectedOperator.value.plans.currentModules.y,
    set: value => selectedOperator.value.plans.currentModules.y = +value
});

const currentModuleZ = computed({
    get: () => selectedOperator.value.plans.currentModules.z,
    set: value => selectedOperator.value.plans.currentModules.z = +value
});

const targetModuleX = computed({
    get: () => selectedOperator.value.plans.targetModules.x,
    set: value => selectedOperator.value.plans.targetModules.x = +value
});

const targetModuleY = computed({
    get: () => selectedOperator.value.plans.targetModules.y,
    set: value => selectedOperator.value.plans.targetModules.y = +value
});

const targetModuleZ = computed({
    get: () => selectedOperator.value.plans.targetModules.z,
    set: value => selectedOperator.value.plans.targetModules.z = +value
});

</script>

<template>
    <div class="col-1">
        <img :src="getOperatorImageLink(operator)" :alt="operator.name" class="img-thumbnail cursor-pointer" @click="collapsed = !collapsed" :class="{ dimmed: !collapsed }" />
    </div>
    <div class="col left-border">
        <div class="row">
            <h4 class="cursor-pointer operator-header" :class="{ open: collapsed }" @click="collapsed = !collapsed">
                {{ operator.name }}
            </h4>
        </div>
        <Collapse :when="collapsed">
            <div class="row">
                <div class="col-6">
                    <label>Current</label>
                    <hr />

                    <div class="row">
                        <div class="col-7" v-if="operator.phases.length > 1">
                            <OperatorPromotion :phases="operator.phases" v-model="currentElite" />
                        </div>
                        <div class="col">
                            <OperatorLevel :maxLevel="currentLevelMax" v-model="currentLevel" />
                        </div>
                    </div>
                    <hr v-if="operator.skills.length > 0" />

                    <div class="row" v-if="operator.skills.length > 0">
                        <div class="input-group">
                            <span class="input-group-text">Skills Level</span>
                            <input type="number" class="form-control" v-model="currentSkill" min="1" :max="currentElite === 0 ? 4 : 7" />
                        </div>
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
                            <OperatorLevel :maxLevel="targetLevelMax" v-model="targetLevel" />
                        </div>
                    </div>
                    <hr v-if="operator.skills.length > 0" />

                    <div class="row" v-if="operator.skills.length > 0">
                        <div class="input-group">
                            <span class="input-group-text">Skills Level</span>
                            <input type="number" class="form-control" v-model="targetSkill" :min="currentSkill" :max="targetElite === 0 ? 4 : 7" />
                        </div>
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
                <OperatorCosts
                    :operatorId="operator.id"
                />
            </div>
        </Collapse>
        <Collapse :when="!collapsed">
            <div class="row" @click="collapsed = !collapsed">
                <div class="col-12">
                    <hr />
                    <div>...</div>
                </div>
            </div>
        </Collapse>
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

.img-thumbnail.dimmed {
    opacity: 0.5;
}

.img-thumbnail.dimmed:hover {
    opacity: 0.75;
}

.cursor-pointer {
    cursor: pointer;
}

.operator-header {
    color: #b3ade9;
    border: 1px solid #464646;
    width: auto;
    margin-left: auto;
    margin-right: auto;
    border-radius: 5px;
    padding: 1px 10px 1px 10px;
}

.operator-header:hover {
    background: #464646;
}

.operator-header::before {
    content: "▸";
}

.operator-header.open::before {
    content: "▾";
}
</style>