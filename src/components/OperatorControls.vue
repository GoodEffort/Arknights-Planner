<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import OperatorPromotion from './controls/OperatorPromotion.vue';
import OperatorLevel from './controls/OperatorLevel.vue';
import OperatorSkillMasteries from './controls/OperatorMasteries.vue';
import type { SaveRecord, SelectedOperator } from '../types/operator';
import OperatorModule from './controls/OperatorModule.vue';
import OperatorCosts from './OperatorCosts.vue';
import ImageFinder from './ImageFinder.vue';
import { usePlannerStore } from '../store/planner-store';
import OperatorControlsTabs from './OperatorControlsTabs.vue';

const props = defineProps<{
    selectedOperator: SelectedOperator;
}>();

const section = ref<'' | 'Plan' | 'Items'>('');

const { selectCharacter } = usePlannerStore();

watch(props.selectedOperator, ({ operator, plans }) => {
    const saveString = `plans-${operator.id}`;
    const saveRecord: SaveRecord = {
        operatorId: operator.id,
        plans,
        active: props.selectedOperator.active
    };
    localStorage.setItem(saveString, JSON.stringify(saveRecord));
}, { deep: true });

const operator = computed(() => props.selectedOperator.operator);

const currentElite = computed({
    get: () => props.selectedOperator.plans.currentElite,
    set: value => {
        const elite: 0 | 1 | 2 = (+value) as 0 | 1 | 2

        if (elite > targetElite.value) {
            targetElite.value = elite;
        }

        props.selectedOperator.plans.currentElite = elite;
    }
});

const targetElite = computed({
    get: () => props.selectedOperator.plans.targetElite,
    set: value => {
        const elite: 0 | 1 | 2 = (+value) as 0 | 1 | 2

        if (elite < currentElite.value) {
            currentElite.value = elite;
        }

        props.selectedOperator.plans.targetElite = elite;
    }
});

const targetLevelMax = computed(() => {
    const phases = props.selectedOperator.operator.phases;
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
    get: () => props.selectedOperator.plans.currentLevel,
    set: value => {
        let newLevel = +value;

        if (newLevel < 1) newLevel = 1;
        if (newLevel > currentLevelMax.value) newLevel = currentLevelMax.value;

        if (newLevel > targetLevel.value && targetElite.value === currentElite.value) {
            targetLevel.value = newLevel;
        }

        props.selectedOperator.plans.currentLevel = newLevel;
    }
});

const targetLevel = computed({
    get: () => props.selectedOperator.plans.targetLevel,
    set: value => {
        let newLevel = +value;

        if (newLevel < 1) newLevel = 1;
        if (newLevel > targetLevelMax.value) newLevel = targetLevelMax.value;

        if (newLevel < currentLevel.value && targetElite.value === currentElite.value) {
            currentLevel.value = newLevel;
        }

        props.selectedOperator.plans.targetLevel = newLevel;
    }
});

const currentSkill = computed({
    get: () => props.selectedOperator.plans.currentSkillLevels,
    set: value => {
        let newSkill = +value;
        const maxSkill = currentElite.value === 0 ? 4 : 7;

        if (newSkill < 1) newSkill = 1;
        if (newSkill > maxSkill) newSkill = maxSkill;

        if (newSkill > targetSkill.value) {
            targetSkill.value = newSkill;
        }

        props.selectedOperator.plans.currentSkillLevels = newSkill;
    }
});

const targetSkill = computed({
    get: () => props.selectedOperator.plans.targetSkillLevels,
    set: value => {
        let newSkill = +value;
        const maxSkill = targetElite.value === 0 ? 4 : 7;

        if (newSkill < currentSkill.value) newSkill = currentSkill.value;
        if (newSkill > maxSkill) newSkill = maxSkill;

        props.selectedOperator.plans.targetSkillLevels = newSkill;
    }
});

const targetMasterySetFn = (skill: 1 | 2 | 3) => (value: number) => {
    let newMastery = +value;

    if (newMastery < 0) newMastery = 0;
    if (newMastery > 3) newMastery = 3;

    props.selectedOperator.plans.targetSkillMasteries[`skill${skill}`] = newMastery;
};

const targetMastery1 = computed({
    get: () => props.selectedOperator.plans.targetSkillMasteries.skill1,
    set: targetMasterySetFn(1)
});

const targetMastery2 = computed({
    get: () => props.selectedOperator.plans.targetSkillMasteries.skill2,
    set: targetMasterySetFn(2)
});

const targetMastery3 = computed({
    get: () => props.selectedOperator.plans.targetSkillMasteries.skill3,
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

    props.selectedOperator.plans.currentSkillMasteries[`skill${skill}`] = newMastery;
};

const currentMastery1 = computed({
    get: () => props.selectedOperator.plans.currentSkillMasteries.skill1,
    set: currentMasterySetFn(1)
});

const currentMastery2 = computed({
    get: () => props.selectedOperator.plans.currentSkillMasteries.skill2,
    set: currentMasterySetFn(2)
});

const currentMastery3 = computed({
    get: () => props.selectedOperator.plans.currentSkillMasteries.skill3,
    set: currentMasterySetFn(3)
});

const hasXModule = computed(() => props.selectedOperator.modules.find(m => m.typeName2 === 'X') !== undefined);
const hasYModule = computed(() => props.selectedOperator.modules.find(m => m.typeName2 === 'Y') !== undefined);
const hasDModule = computed(() => props.selectedOperator.modules.find(m => m.typeName2 === 'D') !== undefined);

const currentModuleX = computed({
    get: () => props.selectedOperator.plans.currentModules.x,
    set: value => props.selectedOperator.plans.currentModules.x = +value
});

const currentModuleY = computed({
    get: () => props.selectedOperator.plans.currentModules.y,
    set: value => props.selectedOperator.plans.currentModules.y = +value
});

const currentModuleD = computed({
    get: () => props.selectedOperator.plans.currentModules.d,
    set: value => props.selectedOperator.plans.currentModules.d = +value
});

const targetModuleX = computed({
    get: () => props.selectedOperator.plans.targetModules.x,
    set: value => props.selectedOperator.plans.targetModules.x = +value
});

const targetModuleY = computed({
    get: () => props.selectedOperator.plans.targetModules.y,
    set: value => props.selectedOperator.plans.targetModules.y = +value
});

const targetModuleD = computed({
    get: () => props.selectedOperator.plans.targetModules.d,
    set: value => props.selectedOperator.plans.targetModules.d = +value
});

const active = computed({
    get: () => props.selectedOperator.active,
    set: value => props.selectedOperator.active = value
});

</script>

<template>
    <div class="row mb-3">
        <div class="col ">
            <div class="row">
                <div class="col center-vert">
                    <h4>
                        {{ operator.name }}
                    </h4>
                </div>
            </div>
            <div class="col-auto">
                <OperatorControlsTabs 
                    :active="active"
                    :section="section"
                    @active="active = !active"
                    @plan="section === 'Plan' ? section = '' : section = 'Plan'"
                    @items="section === 'Items' ? section = '' : section = 'Items'"
                    @remove="selectCharacter(operator)" />
            </div>
        </div>
        <div class="col-auto center-vert">
            <div class="operator-image">
                <ImageFinder :subject="operator" />
            </div>
        </div>
    </div>
    <div class="row ms-md-1" v-if="section === 'Plan'">
        <div class="col-12 col-md-6 plan-section rounded-start">
            <label class="d-md-inline-block d-none">Current</label>
            <h2 class="d-md-none bg-primary border border-info rounded mt-5">Current</h2>
            <hr />

            <div class="row">
                <div class="col-md-7 col-5" v-if="operator.phases.length > 1">
                    <OperatorPromotion :phases="operator.phases" v-model="currentElite"
                        :key="`1${operator.id}-elite`" />
                </div>
                <div class="col">
                    <OperatorLevel :maxLevel="currentLevelMax" v-model="currentLevel" :key="`1${operator.id}-level`" />
                </div>
            </div>
            <hr v-if="operator.skills.length > 0" />

            <div class="row" v-if="operator.skills.length > 0">
                <div class="input-group">
                    <span class="input-group-text">Skill Level</span>
                    <input type="number" class="form-control" v-model="currentSkill" min="1"
                        :max="currentElite === 0 ? 4 : 7" />
                </div>
            </div>
            <hr v-if="operator.phases.length > 2" />

            <div class="row" v-if="operator.phases.length > 2">
                <label>Masteries</label>
                <div class="col pe-0 px-md-auto">
                    <OperatorSkillMasteries v-if="operator.skills.length > 0" v-model="currentMastery1" skillNumber="S1"
                        :key="`1${operator.id}-skill1`" />
                </div>
                <div class="col px-1 px-md-auto">
                    <OperatorSkillMasteries v-if="operator.skills.length > 1" v-model="currentMastery2" skillNumber="S2"
                        :key="`1${operator.id}-skill2`" />
                </div>
                <div class="col ps-0 px-md-auto">
                    <OperatorSkillMasteries v-if="operator.skills.length > 2" v-model="currentMastery3" skillNumber="S3"
                        :key="`1${operator.id}-skill3`" />
                </div>
            </div>
            <hr v-if="selectedOperator.modules.length > 0" />

            <div class="row" v-if="selectedOperator.modules.length > 0">
                <label>Modules</label>
                <div class="col" v-if="hasXModule">
                    <OperatorModule  v-model="currentModuleX" module-letter="X"
                        :key="`1${operator.id}-mx`" />
                </div>
                <div class="col" v-if="hasYModule">
                    <OperatorModule  v-model="currentModuleY" module-letter="Y"
                        :key="`1${operator.id}-my`" />
                </div>
                <div class="col" v-if="hasDModule">
                    <OperatorModule v-model="currentModuleD" module-letter="Δ"
                        :key="`1${operator.id}-md`" />
                </div>
            </div>

        </div>
        <div class="col-12 col-md-6 plan-section rounded-end">
            <label class="d-md-inline-block d-none">Planned</label>
            <h2 class="d-md-none bg-primary border border-info rounded mt-5">Planned</h2>
            <hr />

            <div class="row">
                <div class="col-7" v-if="operator.phases.length > 1">
                    <OperatorPromotion :phases="operator.phases" v-model="targetElite" :key="`2${operator.id}-elite`" />
                </div>
                <div class="col">
                    <OperatorLevel :maxLevel="targetLevelMax" v-model="targetLevel" :key="`2${operator.id}-level`" />
                </div>
            </div>
            <hr v-if="operator.skills.length > 0" />

            <div class="row" v-if="operator.skills.length > 0">
                <div class="input-group">
                    <span class="input-group-text">Skill Level</span>
                    <input type="number" class="form-control" v-model="targetSkill" :min="currentSkill"
                        :max="targetElite === 0 ? 4 : 7" />
                </div>
            </div>
            <hr v-if="operator.phases.length > 2" />

            <div class="row" v-if="operator.phases.length > 2">
                <label>Skill</label>
                <div class="col pe-0 px-md-auto">
                    <OperatorSkillMasteries v-if="operator.skills.length > 0" v-model="targetMastery1" skillNumber="S1"
                        :key="`2${operator.id}-skill1`" />
                </div>
                <div class="col px-1 px-md-auto">
                    <OperatorSkillMasteries v-if="operator.skills.length > 1" v-model="targetMastery2" skillNumber="S2"
                        :key="`2${operator.id}-skill2`" />
                </div>
                <div class="col ps-0 px-md-auto">
                    <OperatorSkillMasteries v-if="operator.skills.length > 2" v-model="targetMastery3" skillNumber="S3"
                        :key="`2${operator.id}-skill3`" />
                </div>
            </div>
            <hr v-if="selectedOperator.modules.length > 0" />

            <div class="row" v-if="selectedOperator.modules.length > 0">
                <label>Modules</label>
                <div class="col" v-if="hasXModule">
                    <OperatorModule v-model="targetModuleX" module-letter="X"
                        :key="`2${operator.id}-mx`" />
                </div>
                <div class="col" v-if="hasYModule">
                    <OperatorModule v-model="targetModuleY" module-letter="Y"
                        :key="`2${operator.id}-my`" />
                </div>
                <div class="col" v-if="hasDModule">
                    <OperatorModule v-model="targetModuleD" module-letter="Δ"
                        :key="`2${operator.id}-md`" />
                </div>
            </div>
        </div>
    </div>
    <div v-if="section === 'Items'" class="row">
        <OperatorCosts :selected-operator="selectedOperator" :key="`${operator.id}-costs`" />
    </div>
</template>

<style scoped>
.center-vert {
    margin-top: auto;
    margin-bottom: auto;
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

.operator-image {
    width: 75px;
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

html.dark .plan-section {
    @media screen and (min-width: 500px) {
        background-image: linear-gradient(rgb(20, 20, 20), rgb(24, 24, 24));
    }
}

.plan-section {
    @media screen and (min-width: 500px) {
        padding-bottom: 10px;
        padding-top: 10px;
    }
}
</style>