<script setup lang="ts">
import { computed, ref } from 'vue';
import OperatorSkillMasteries from '@/components/controls/OperatorSkillMasteries.vue';
import type { SelectedOperator } from '@/types/planner-types';
import OperatorCosts from '@/components/controls/OperatorCosts.vue';
import ImageFinder from '@/components/akplanner/ImageFinder.vue';
import { usePlannerStore } from '@/store/planner-store';
import OperatorControlsTabs from '@/components/controls/OperatorControlsTabs.vue';
import OperatorModules from '@/components/controls/OperatorModules.vue';
import OperatorLevelPromotion from '@/components/controls/OperatorLevelPromotion.vue';
import OperatorSkillLevels from '@/components/controls/OperatorSkillLevels.vue';
import Tooltip from '@/components/generic/Tooltip.vue';
import { storeToRefs } from 'pinia';

const props = defineProps<{
    selectedOperator: SelectedOperator;
    sortedList: SelectedOperator[];
    enableMove: boolean;
}>();

const section = ref<'' | 'Plan' | 'Items'>('');
const store = usePlannerStore();
const { selectCharacter } = store;
const { selectedOperators } = storeToRefs(store);

const operator = computed(() => props.selectedOperator.operator);

const active = computed({
    get: () => props.selectedOperator.active,
    set: value => props.selectedOperator.active = value
});

const moveOperator = (direction: 'up' | 'down') => {
    const sortedList = props.sortedList.slice();
    const operators = selectedOperators.value.slice();

    // doing this made it a little faster as all the computed properties were being recalculated when the array was being modified
    selectedOperators.value = [];

    let index = sortedList.findIndex(op => op === props.selectedOperator);

    if (direction === 'up') {
        if (index === 0) {
            return;
        }

        const currentId = props.selectedOperator.operator.id;
        const current = operators.find(op => op.operator.id === currentId);

        const targetid = sortedList[index - 1].operator.id;
        const target = operators.find(op => op.operator.id === targetid);

        if (!target || !current) {
            return;
        }

        if (target.sort === current.sort) {
            current.sort--;
        }
        else {
            const temp = target.sort;

            target.sort = current.sort;
            current.sort = temp;

        }
    } else {
        if (index === sortedList.length - 1) {
            return;
        }

        const currentId = props.selectedOperator.operator.id;
        const current = operators.find(op => op.operator.id === currentId);

        const targetid = sortedList[index + 1].operator.id;
        const target = operators.find(op => op.operator.id === targetid);

        if (!target || !current) {
            return;
        }

        if (target.sort === current.sort) {
            props.selectedOperator.sort++;
        }
        else {
            const temp = target.sort;

            target.sort = current.sort;
            current.sort = temp;
        }
    }

    // put the array back in the store
    selectedOperators.value = operators;
};

const goalsCount = computed(() => {
    const plans = props.selectedOperator.plans;

    let count = 0;

    if (plans.currentElite < plans.targetElite) {
        count += plans.targetElite - plans.currentElite;
    }
    if (plans.currentLevel < plans.targetLevel || plans.currentElite < plans.targetElite) {
        count++;
    }
    if (plans.currentSkillLevels < plans.targetSkillLevels) {
        count += plans.targetSkillLevels - plans.currentSkillLevels;
    }
    if (plans.currentSkillMasteries.skill1 < plans.targetSkillMasteries.skill1) {
        count += plans.targetSkillMasteries.skill1 - plans.currentSkillMasteries.skill1;
    }
    if (plans.currentSkillMasteries.skill2 < plans.targetSkillMasteries.skill2) {
        count += plans.targetSkillMasteries.skill2 - plans.currentSkillMasteries.skill2;
    }
    if (plans.currentSkillMasteries.skill3 < plans.targetSkillMasteries.skill3) {
        count += plans.targetSkillMasteries.skill3 - plans.currentSkillMasteries.skill3;
    }

    const currentModGoal = plans.currentModules.reduce((acc, mod) => acc + mod.level, 0);
    const targetModGoal = plans.targetModules.reduce((acc, mod) => acc + mod.level, 0);

    if (currentModGoal < targetModGoal) {
        count += targetModGoal - currentModGoal;
    }

    return count;
})

const openWiki = () =>
    window.open(`https://arknights.wiki.gg/wiki/${operator.value.name.replace(' - ','/').replace(' ', '_')}`, '_blank');


</script>

<template>
    <div class="row mb-3">
        <div class="col-75 col-md">
            <div class="row">
                <div class="col-1 text-center">
                    <span class="badge rounded-pill bg-primary translate-up" v-if="goalsCount > 0">{{ goalsCount
                        }}</span>
                </div>
                <div class="col center-vert">
                    <h4>
                        <span>{{ operator.name }}</span>
                        <span v-if="operator.cnOnly">
                            <span>&nbsp;</span>
                            <Tooltip tooltipText="CN Server only Operator for now">
                                <font-awesome-icon icon="clock" />
                            </Tooltip>
                        </span>
                    </h4>
                </div>
                <div class="col-1"></div>
            </div>
            <div class="col-auto">
                <OperatorControlsTabs :active="active" :section="section" @active="active = !active"
                    @plan="section === 'Plan' ? section = '' : section = 'Plan'"
                    @items="section === 'Items' ? section = '' : section = 'Items'"
                    @remove="selectCharacter(operator)" />
            </div>
        </div>
        <div class="col-auto mt-md-0 mt-4 pe-0" v-if="enableMove">
            <div class="mt-2">
                <button @click="moveOperator('up')" class="btn btn-primary btn-up"
                    :disabled="sortedList[0] === props.selectedOperator">▲</button>
            </div>
            <div>
                <button @click="moveOperator('down')" class="btn btn-primary btn-dn"
                    :disabled="sortedList[sortedList.length - 1] === props.selectedOperator">▼</button>
            </div>
        </div>
        <div class="col-md-auto col center-vert pe-0 pt-0 pb-0 px-md-2">
            <div class="operator-image" @click="openWiki">
                <ImageFinder :subject="operator" />
            </div>
        </div>
    </div>
    <Transition>
        <div class="row ms-md-1" v-if="section === 'Plan'">
            <div class="col-12 col-md-6 plan-section rounded-start">
                <h5 class="d-md-inline-block d-none">Current Stats</h5>
                <h2 class="d-md-none bg-primary border border-info rounded mt-5">Current</h2>
                <OperatorLevelPromotion :selectedOperator="selectedOperator" type="current" />
                <OperatorSkillLevels v-if="operator.skills.length > 0" :selected-operator="selectedOperator"
                    type="current" />
                <OperatorSkillMasteries
                    v-if="operator.skills.length > 0 && operator.rarity !== 'TIER_2' && operator.rarity !== 'TIER_3'"
                    :selected-operator="selectedOperator" type="current" />
                <OperatorModules v-if="operator.modules.length > 0" :selected-operator="selectedOperator"
                    type="current" />
            </div>
            <div class="col-12 col-md-6 plan-section rounded-end">
                <h5 class="d-md-inline-block d-none">Target Stats</h5>
                <h2 class="d-md-none bg-primary border border-info rounded mt-5">Planned</h2>
                <OperatorLevelPromotion :selectedOperator="selectedOperator" type="target" />
                <OperatorSkillLevels v-if="operator.skills.length > 0" :selected-operator="selectedOperator"
                    type="target" />
                <OperatorSkillMasteries
                    v-if="operator.skills.length > 0 && operator.rarity !== 'TIER_2' && operator.rarity !== 'TIER_3'"
                    :selected-operator="selectedOperator" type="target" />
                <OperatorModules v-if="operator.modules.length > 0" :selected-operator="selectedOperator"
                    type="target" />
            </div>
        </div>
    </Transition>
    <Transition>
        <div v-if="section === 'Items'" class="row">
            <OperatorCosts :selected-operator="selectedOperator" :key="`${operator.id}-costs`" />
        </div>
    </Transition>
</template>

<style scoped>
.col-75 {
    @media screen and (max-width: 768px) {
        flex: 0 0 auto;
        width: 60%
    }
}

.btn-up {
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
}

.btn-dn {
    border-top-left-radius: 0px;
    border-top-right-radius: 0px;
}

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

.operator-image img {
    cursor: pointer;
    @media screen and (min-width: 768px) {
        max-height: 75px;
        width: 75px;
    }

    @media screen and (max-width: 768px) {
        margin-top: 1em;
        margin-bottom: 0px;
        max-height: 8em;
        width: 100%;
    }
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
        border: 1px solid #3d3d3d;
        border-left: 0px;
        border-right: 0px;
    }
}

.plan-section {
    @media screen and (min-width: 500px) {
        padding-bottom: 10px;
        padding-top: 10px;
    }
}

.v-move,
.v-enter-active {
    transition: 0.2s .1 ease-in-out;
}

.v-leave-active {
    transition: 0.1s ease-in-out;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
</style>