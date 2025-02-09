<script setup lang="ts">
import { usePlannerStore } from '@/store/planner-store';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import OperatorCostRow from '@/components/controls/items/OperatorCostRow.vue';
import type { ComputedRef } from 'vue';
import type { LevelUpNeeds, LevelUpNeedsKey, SelectedOperator } from '@/types/planner-types';

const { totalCostsByOperatorCategorized, selectedOperators, inventory } = storeToRefs(usePlannerStore());

const props = defineProps<{
    selectedOperator: SelectedOperator;
}>();

const Costs: ComputedRef<LevelUpNeeds> = computed(() => totalCostsByOperatorCategorized.value[props.selectedOperator.operator.id] ?? []);

const ShowRow = (costs: { [key: string]: number }) => Object.keys(costs ?? {}).length > 0;

const currentRank = computed(() => props.selectedOperator.plans.currentElite);

const CanMasteryBeApplied = computed(() => {
    return currentRank.value === 2 && props.selectedOperator.plans.currentSkillLevels === 7;
});

const CanModuleBeApplied = computed(() => {
    const operator = props.selectedOperator.operator;

    switch (operator.rarity) {
        case 'TIER_4':
        case 'TIER_5':
        case 'TIER_6':
            return currentRank.value === 2;
        default:
            return false;
    }
});

const CanE1 = computed(() => {
    switch (props.selectedOperator.operator.rarity) {
        case 'TIER_3':
        case 'TIER_4':
        case 'TIER_5':
        case 'TIER_6':
            return currentRank.value === 0;
        default:
            return false;
    }
});

const CanE2 = computed(() => {
    switch (props.selectedOperator.operator.rarity) {
        case 'TIER_4':
        case 'TIER_5':
        case 'TIER_6':
            return currentRank.value === 1;
        default:
            return false;
    }
});

const applyModuleUpgrade = (costs: { [key: string]: number }, type: string, rank: number) => {
    const currentPlan = selectedOperators.value.find(op => op.operator.id === props.selectedOperator.operator.id)?.plans;

    if (currentPlan == null) {
        return;
    }

    for (const [itemId, count] of Object.entries(costs)) {
        if (inventory.value[itemId] < count) {
            return;
        }
    }

    const currentModule = currentPlan.currentModules.find(a => a.type === type);

    if (currentModule == null) {
        currentPlan.currentModules.push({ type, level: rank });
    }
    else {
        currentModule.level = rank;
    }

    for (const [itemId, count] of Object.entries(costs)) {
        inventory.value[itemId] -= count;
    }
};

const applyUpgrade = (costs: { [key: string]: number }, type: 'SkillLevel' | 'Skill1Mastery' | 'Skill2Mastery' | 'Skill3Mastery' | 'E1' | 'E2', rank: number) => {
    const currentPlan = selectedOperators.value.find(op => op.operator.id === props.selectedOperator.operator.id)?.plans;

    if (currentPlan == null) {
        return;
    }

    for (const [itemId, count] of Object.entries(costs)) {
        if (inventory.value[itemId] < count) {
            return;
        }
    }

    switch (type) {
        case 'SkillLevel':
            currentPlan.currentSkillLevels = rank;
            break;
        case 'Skill1Mastery':
            currentPlan.currentSkillMasteries.skill1 = rank;
            break;
        case 'Skill2Mastery':
            currentPlan.currentSkillMasteries.skill2 = rank;
            break;
        case 'Skill3Mastery':
            currentPlan.currentSkillMasteries.skill3 = rank;
            break;
        case 'E1':
            currentPlan.currentLevel = 1;
            currentPlan.currentElite = 1;
            break;
        case 'E2':
            currentPlan.currentLevel = 1;
            currentPlan.currentElite = 2;        
            break;
    }

    for (const [itemId, count] of Object.entries(costs)) {
        inventory.value[itemId] -= count;
    }
};

const showAnyRow = computed(() => {
    const currentCosts = Costs.value;
    for (const key in currentCosts) {
        if (key === 'skill') {
            for (const skillCost of currentCosts[key as 'skill']) {
                if (ShowRow(skillCost)) {
                    return true;
                }
            }
        }
        else if (ShowRow(currentCosts[key as LevelUpNeedsKey])) {
            return true;
        }
    }
    return false;
});

const checkPreviousModuleLevels = (moduleCosts: { [key: string]: number }[], index: number) => {
    return moduleCosts.slice(0, index).every(a => JSON.stringify(a) === '{}');
};

</script>

<template>
    <div class="container mt-4 ms-md-2 ms-0 me-0 asdf" v-if="showAnyRow">
        <!-- Promotion and Level Up Costs -->

        <div class="row" v-if="ShowRow(Costs.levelup)">
            <OperatorCostRow :costs="Costs.levelup" title="Level Up" :enable-apply="false" :hide-apply="true" />
        </div>

        <div class="row" v-if="ShowRow(Costs.e1)">
            <OperatorCostRow :costs="Costs.e1" title="Elite 1" :enable-apply="CanE1" :hide-apply="false"
                @apply-upgrade="costs => applyUpgrade(costs, 'E1', 0)" />
        </div>

        <div class="row" v-if="ShowRow(Costs.e2)">
            <OperatorCostRow :costs="Costs.e2" title="Elite 2" :enable-apply="CanE2" :hide-apply="false"
                @apply-upgrade="costs => applyUpgrade(costs, 'E2', 0)" />
        </div>

        <!-- Skill up Costs -->

        <div class="row" v-for="skillCost in Costs.skill.filter(c => JSON.stringify(c) !== '{}')">
            <!-- +2 because skills start at 1 so the first cost is at 2 -->
            <OperatorCostRow :costs="skillCost" :title="`Skill ${Costs.skill.indexOf(skillCost) + 2}`"
                :enable-apply="(selectedOperator.plans.currentSkillLevels - 1) === Costs.skill.indexOf(skillCost)" :hide-apply="false"
                @apply-upgrade="costs => applyUpgrade(costs, 'SkillLevel', Costs.skill.indexOf(skillCost) + 2)" />
        </div>

        <!-- Skill 1 Masteries -->
        <div class="row" v-if="ShowRow(Costs.s1m1)">
            <OperatorCostRow :costs="Costs.s1m1" title="Skill 1 Mastery 1"
                :enable-apply="CanMasteryBeApplied && selectedOperator.plans.currentSkillMasteries.skill1 === 0"
                :hide-apply="false" @apply-upgrade="costs => applyUpgrade(costs, 'Skill1Mastery', 1)" />
        </div>
        <div class="row" v-if="ShowRow(Costs.s1m2)">
            <OperatorCostRow :costs="Costs.s1m2" title="Skill 1 Mastery 2"
                :enable-apply="CanMasteryBeApplied && selectedOperator.plans.currentSkillMasteries.skill1 === 1"
                :hide-apply="false" @apply-upgrade="costs => applyUpgrade(costs, 'Skill1Mastery', 2)" />
        </div>
        <div class="row" v-if="ShowRow(Costs.s1m3)">
            <OperatorCostRow :costs="Costs.s1m3" title="Skill 1 Mastery 3"
                :enable-apply="CanMasteryBeApplied && selectedOperator.plans.currentSkillMasteries.skill1 === 2"
                :hide-apply="false" @apply-upgrade="costs => applyUpgrade(costs, 'Skill1Mastery', 3)" />
        </div>

        <!-- Skill 2 Masteries -->

        <div class="row" v-if="ShowRow(Costs.s2m1)">
            <OperatorCostRow :costs="Costs.s2m1" title="Skill 2 Mastery 1"
                :enable-apply="CanMasteryBeApplied && selectedOperator.plans.currentSkillMasteries.skill2 === 0"
                :hide-apply="false" @apply-upgrade="costs => applyUpgrade(costs, 'Skill2Mastery', 1)" />
        </div>
        <div class="row" v-if="ShowRow(Costs.s2m2)">
            <OperatorCostRow :costs="Costs.s2m2" title="Skill 2 Mastery 2"
                :enable-apply="CanMasteryBeApplied && selectedOperator.plans.currentSkillMasteries.skill2 === 1"
                :hide-apply="false" @apply-upgrade="costs => applyUpgrade(costs, 'Skill2Mastery', 2)" />
        </div>
        <div class="row" v-if="ShowRow(Costs.s2m3)">
            <OperatorCostRow :costs="Costs.s2m3" title="Skill 2 Mastery 3"
                :enable-apply="CanMasteryBeApplied && selectedOperator.plans.currentSkillMasteries.skill2 === 2"
                :hide-apply="false" @apply-upgrade="costs => applyUpgrade(costs, 'Skill2Mastery', 3)" />
        </div>

        <!-- Skill 3 Masteries -->
        <div class="row" v-if="ShowRow(Costs.s3m1)">
            <OperatorCostRow :costs="Costs.s3m1" title="Skill 3 Mastery 1"
                :enable-apply="CanMasteryBeApplied && selectedOperator.plans.currentSkillMasteries.skill3 === 0"
                :hide-apply="false" @apply-upgrade="costs => applyUpgrade(costs, 'Skill3Mastery', 1)" />
        </div>
        <div class="row" v-if="ShowRow(Costs.s3m2)">
            <OperatorCostRow :costs="Costs.s3m2" title="Skill 3 Mastery 2"
                :enable-apply="CanMasteryBeApplied && selectedOperator.plans.currentSkillMasteries.skill3 === 1"
                :hide-apply="false" @apply-upgrade="costs => applyUpgrade(costs, 'Skill3Mastery', 2)" />
        </div>
        <div class="row" v-if="ShowRow(Costs.s3m3)">
            <OperatorCostRow :costs="Costs.s3m3" title="Skill 3 Mastery 3"
                :enable-apply="CanMasteryBeApplied && selectedOperator.plans.currentSkillMasteries.skill3 === 2"
                :hide-apply="false" @apply-upgrade="costs => applyUpgrade(costs, 'Skill3Mastery', 3)" />
        </div>

        <!-- Modules -->
        <div v-for="[type, moduleCosts] in Object.entries(Costs.modules)">
            <div v-for="(cost, index) in moduleCosts">
                <div class="row" v-if="JSON.stringify(cost) !== '{}' && moduleCosts.length > 0">
                    <OperatorCostRow :costs="cost"
                        :title="`Module ${type} Level ${ index + 1 }`"
                        :enable-apply="checkPreviousModuleLevels(moduleCosts, index) && CanModuleBeApplied"
                        :hide-apply="false" @apply-upgrade="costs => applyModuleUpgrade(costs, type, index + 1)" />
                </div>
            </div>
        </div>
    </div>
    <div class="container mt-4" v-else>
        <div class="row">
            <div class="col-12">
                <p class="text-center">No Costs</p>
                <p class="text-center">Please add a plan for this operator under the plans section for them to add cost
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.asdf div.row {
    padding: 0.5rem;
    border-radius: 0.25rem;
    margin-bottom: 0.5rem;
    background-image: linear-gradient(rgb(204, 204, 204), rgb(201, 201, 201));
}

html.dark .asdf div.row {
    background-image: linear-gradient(rgb(0, 0, 0), rgb(19, 19, 19));
    border: 1px solid #616161;
    border-right: 0px;
    border-left: 0px;
}
</style>