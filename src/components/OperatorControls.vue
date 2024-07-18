<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import OperatorSkillMasteries from './controls/OperatorSkillMasteries.vue';
import type { SaveRecord, SelectedOperator } from '../types/operator';
import OperatorCosts from './OperatorCosts.vue';
import ImageFinder from './ImageFinder.vue';
import { usePlannerStore } from '../store/planner-store';
import OperatorControlsTabs from './OperatorControlsTabs.vue';
import OperatorModules from './controls/OperatorModules.vue';
import OperatorLevelPromotion from './controls/OperatorLevelPromotion.vue';
import OperatorSkillLevels from './controls/OperatorSkillLevels.vue';

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

const active = computed({
    get: () => props.selectedOperator.active,
    set: value => props.selectedOperator.active = value
});

</script>

<template>
    <div class="row mb-3">
        <div class="col-9 col-md">
            <div class="row">
                <div class="col center-vert">
                    <h4>
                        {{ operator.name }}
                    </h4>
                </div>
            </div>
            <div class="col-auto">
                <OperatorControlsTabs :active="active" :section="section" @active="active = !active"
                    @plan="section === 'Plan' ? section = '' : section = 'Plan'"
                    @items="section === 'Items' ? section = '' : section = 'Items'"
                    @remove="selectCharacter(operator)" />
            </div>
        </div>
        <div class="col-md-auto col-3 center-vert p-0 px-md-2">
            <div class="operator-image">
                <ImageFinder :subject="operator" />
            </div>
        </div>
    </div>
    <Transition>
        <div class="row ms-md-1" v-if="section === 'Plan'">
            <div class="col-12 col-md-6 plan-section rounded-start">
                <label class="d-md-inline-block d-none">Current</label>
                <h2 class="d-md-none bg-primary border border-info rounded mt-5">Current</h2>
                <OperatorLevelPromotion :selectedOperator="selectedOperator" type="current" />
                <OperatorSkillLevels v-if="operator.skills.length > 0" :selected-operator="selectedOperator"
                    type="current" />
                <OperatorSkillMasteries v-if="operator.skills.length > 0" :selected-operator="selectedOperator"
                    type="current" />
                <OperatorModules v-if="selectedOperator.modules.length > 0" :selected-operator="selectedOperator"
                    type="current" />
            </div>
            <div class="col-12 col-md-6 plan-section rounded-end">
                <label class="d-md-inline-block d-none">Planned</label>
                <h2 class="d-md-none bg-primary border border-info rounded mt-5">Planned</h2>
                <OperatorLevelPromotion :selectedOperator="selectedOperator" type="target" />
                <OperatorSkillLevels v-if="operator.skills.length > 0" :selected-operator="selectedOperator"
                    type="target" />
                <OperatorSkillMasteries v-if="operator.skills.length > 0" :selected-operator="selectedOperator"
                    type="target" />
                <OperatorModules v-if="selectedOperator.modules.length > 0" :selected-operator="selectedOperator"
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
    }
}

.plan-section {
    @media screen and (min-width: 500px) {
        padding-bottom: 10px;
        padding-top: 10px;
    }
}
.v-move,
.v-enter-active,
.v-leave-active {
  transition: 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>