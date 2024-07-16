<script setup lang="ts">
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import OperatorCostRow from './OperatorCostRow.vue';
import { SelectedOperator } from '../types/operator';

const { totalCostsByOperatorCategorized, selectedOperators, inventory } = storeToRefs(usePlannerStore());

const props = defineProps<{
    selectedOperator: SelectedOperator;
}>();

const Costs = computed(() => totalCostsByOperatorCategorized.value[props.selectedOperator.operator.id] ?? []);

const ShowRow = (costs: { [key: string]: number }) => Object.keys(costs??{}).length > 0;

const isE2 = computed(() => props.selectedOperator.plans.currentElite === 2);

const CanMasteryBeApplied = computed(() => {
    return isE2.value && props.selectedOperator.plans.currentSkillLevels === 7;
});

const CanModuleBeApplied = computed(() => {
    const operator = props.selectedOperator.operator;
    const e2 = isE2.value;
    const level = props.selectedOperator.plans.currentLevel;

    switch (operator.rarity) {
        case 'TIER_4':
            return e2 && level >= 40;
        case 'TIER_5':
            return e2 && level >= 50;
        case 'TIER_6':
            return e2 && level >= 60;
        default:
            return false;
    }
});

const applyUpgrade = (costs: { [key: string]: number }, type: 'SkillLevel' | 'Skill1Mastery' | 'Skill2Mastery' | 'Skill3Mastery' | 'ModuleX' | 'ModuleY' | 'ModuleD' | 'E1' | 'E2', rank: number) => {
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
        case 'ModuleX':
            currentPlan.currentModules.x = rank;
            break;
        case 'ModuleY':
            currentPlan.currentModules.y = rank;
            break;
        case 'ModuleD':
            currentPlan.currentModules.z = rank;
            break;
        case 'E1':
            currentPlan.currentElite = 1;
            break;
        case 'E2':
            currentPlan.currentElite = 2;
            break;
    }

    for (const [itemId, count] of Object.entries(costs)) {
        inventory.value[itemId] -= count;
    }
};

</script>

<template>
    <div class="container mt-4">
        <!-- Skill 1 Masteries -->
        <div class="row" v-if="ShowRow(Costs.s1m1)">
            <OperatorCostRow :costs="Costs.s1m1" title="Skill 1 Mastery 1"
                :enable-apply="CanMasteryBeApplied && selectedOperator.plans.currentSkillMasteries.skill1 === 0"
                @apply-upgrade="costs => applyUpgrade(costs, 'Skill1Mastery', 1)"/>
        </div>
        <div class="row" v-if="ShowRow(Costs.s1m2)">
            <OperatorCostRow :costs="Costs.s1m2" title="Skill 1 Mastery 2"
                :enable-apply="CanMasteryBeApplied && selectedOperator.plans.currentSkillMasteries.skill1 === 1"
                @apply-upgrade="costs => applyUpgrade(costs, 'Skill1Mastery', 2)"/>
        </div>
        <div class="row" v-if="ShowRow(Costs.s1m3)">
            <OperatorCostRow :costs="Costs.s1m3" title="Skill 1 Mastery 3"
                :enable-apply="CanMasteryBeApplied && selectedOperator.plans.currentSkillMasteries.skill1 === 2" 
                @apply-upgrade="costs => applyUpgrade(costs, 'Skill1Mastery', 3)"/>
        </div>

        <!-- Skill 2 Masteries -->

        <div class="row" v-if="ShowRow(Costs.s2m1)">
            <OperatorCostRow :costs="Costs.s2m1" title="Skill 2 Mastery 1"
                :enable-apply="CanMasteryBeApplied && selectedOperator.plans.currentSkillMasteries.skill2 === 0" 
                @apply-upgrade="costs => applyUpgrade(costs, 'Skill2Mastery', 1)"/>
        </div>
        <div class="row" v-if="ShowRow(Costs.s2m2)">
            <OperatorCostRow :costs="Costs.s2m2" title="Skill 2 Mastery 2"
                :enable-apply="CanMasteryBeApplied && selectedOperator.plans.currentSkillMasteries.skill2 === 1" 
                @apply-upgrade="costs => applyUpgrade(costs, 'Skill2Mastery', 2)"/>
        </div>
        <div class="row" v-if="ShowRow(Costs.s2m3)">
            <OperatorCostRow :costs="Costs.s2m3" title="Skill 2 Mastery 3"
                :enable-apply="CanMasteryBeApplied && selectedOperator.plans.currentSkillMasteries.skill2 === 2" 
                @apply-upgrade="costs => applyUpgrade(costs, 'Skill2Mastery', 3)"/>
        </div>

        <!-- Skill 3 Masteries -->
        <div class="row" v-if="ShowRow(Costs.s3m1)">
            <OperatorCostRow :costs="Costs.s3m1" title="Skill 3 Mastery 1"
                :enable-apply="CanMasteryBeApplied && selectedOperator.plans.currentSkillMasteries.skill3 === 0" 
                @apply-upgrade="costs => applyUpgrade(costs, 'Skill3Mastery', 1)"/>
        </div>
        <div class="row" v-if="ShowRow(Costs.s3m2)">
            <OperatorCostRow :costs="Costs.s3m2" title="Skill 3 Mastery 2"
                :enable-apply="CanMasteryBeApplied && selectedOperator.plans.currentSkillMasteries.skill3 === 1" 
                @apply-upgrade="costs => applyUpgrade(costs, 'Skill3Mastery', 2)"/>
        </div>
        <div class="row" v-if="ShowRow(Costs.s3m3)">
            <OperatorCostRow :costs="Costs.s3m3" title="Skill 3 Mastery 3"
                :enable-apply="CanMasteryBeApplied && selectedOperator.plans.currentSkillMasteries.skill3 === 2" 
                @apply-upgrade="costs => applyUpgrade(costs, 'Skill3Mastery', 3)"/>
        </div>

        <!-- Module X -->
        <div class="row" v-if="ShowRow(Costs.mxl1)">
            <OperatorCostRow :costs="Costs.mxl1" title="Module X Level 1"
                :enable-apply="CanModuleBeApplied && selectedOperator.plans.currentModules.x === 0" 
                @apply-upgrade="costs => applyUpgrade(costs, 'ModuleX', 1)"/>
        </div>
        <div class="row" v-if="ShowRow(Costs.mxl2)">
            <OperatorCostRow :costs="Costs.mxl2" title="Module X Level 2"
                :enable-apply="CanModuleBeApplied && selectedOperator.plans.currentModules.x === 1" 
                @apply-upgrade="costs => applyUpgrade(costs, 'ModuleX', 2)"/>
        </div>
        <div class="row" v-if="ShowRow(Costs.mxl3)">
            <OperatorCostRow :costs="Costs.mxl3" title="Module X Level 3"
                :enable-apply="CanModuleBeApplied && selectedOperator.plans.currentModules.x === 2" 
                @apply-upgrade="costs => applyUpgrade(costs, 'ModuleX', 3)"/>
        </div>
        <!-- Module Y -->
        <div class="row" v-if="ShowRow(Costs.myl1)">
            <OperatorCostRow :costs="Costs.myl1" title="Module Y Level 1"
                :enable-apply="CanModuleBeApplied && selectedOperator.plans.currentModules.y === 0" 
                @apply-upgrade="costs => applyUpgrade(costs, 'ModuleY', 1)"/>
        </div>
        <div class="row" v-if="ShowRow(Costs.myl2)">
            <OperatorCostRow :costs="Costs.myl2" title="Module Y Level 2"
                :enable-apply="CanModuleBeApplied && selectedOperator.plans.currentModules.y === 1" 
                @apply-upgrade="costs => applyUpgrade(costs, 'ModuleY', 2)"/>
        </div>
        <div class="row" v-if="ShowRow(Costs.myl3)">
            <OperatorCostRow :costs="Costs.myl3" title="Module Y Level 3"
                :enable-apply="CanModuleBeApplied && selectedOperator.plans.currentModules.x === 2" 
                @apply-upgrade="costs => applyUpgrade(costs, 'ModuleY', 3)"/>
        </div>
        <!-- Module Z/Δ -->
        <div class="row" v-if="ShowRow(Costs.mdl1)">
            <OperatorCostRow :costs="Costs.mdl1" title="Module Δ Level 1"
                :enable-apply="CanModuleBeApplied && selectedOperator.plans.currentModules.z === 0" 
                @apply-upgrade="costs => applyUpgrade(costs, 'ModuleD', 1)"/>
        </div>
        <div class="row" v-if="ShowRow(Costs.mdl2)">
            <OperatorCostRow :costs="Costs.mdl2" title="Module Δ Level 2"
                :enable-apply="CanModuleBeApplied && selectedOperator.plans.currentModules.z === 1" 
                @apply-upgrade="costs => applyUpgrade(costs, 'ModuleD', 2)"/>
        </div>
        <div class="row" v-if="ShowRow(Costs.mdl3)">
            <OperatorCostRow :costs="Costs.mdl3" title="Module Δ Level 3"
                :enable-apply="CanModuleBeApplied && selectedOperator.plans.currentModules.x === 2" 
                @apply-upgrade="costs => applyUpgrade(costs, 'ModuleD', 3)"/>
        </div>

        <!-- Skill up Costs -->

        <div class="row" v-if="ShowRow(Costs.skill[0])">
            <OperatorCostRow :costs="Costs.skill[0]" title="Skill 2 Costs"
                :enable-apply="selectedOperator.plans.currentSkillLevels === 1" 
                @apply-upgrade="costs => applyUpgrade(costs, 'SkillLevel', 2)"/>
        </div>
        <div class="row" v-if="ShowRow(Costs.skill[1])">
            <OperatorCostRow :costs="Costs.skill[1]" title="Skill 3 Costs"
                :enable-apply="selectedOperator.plans.currentSkillLevels === 2" 
                @apply-upgrade="costs => applyUpgrade(costs, 'SkillLevel', 3)"/>
        </div>
        <div class="row" v-if="ShowRow(Costs.skill[2])">
            <OperatorCostRow :costs="Costs.skill[2]" title="Skill 4 Costs"
                :enable-apply="selectedOperator.plans.currentSkillLevels === 3" 
                @apply-upgrade="costs => applyUpgrade(costs, 'SkillLevel', 4)"/>
        </div>
        <div class="row" v-if="ShowRow(Costs.skill[3])">
            <OperatorCostRow :costs="Costs.skill[3]" title="Skill 5 Costs"
                :enable-apply="selectedOperator.plans.currentSkillLevels === 4" 
                @apply-upgrade="costs => applyUpgrade(costs, 'SkillLevel', 5)"/>
        </div>
        <div class="row" v-if="ShowRow(Costs.skill[4])">
            <OperatorCostRow :costs="Costs.skill[4]" title="Skill 6 Costs"
                :enable-apply="selectedOperator.plans.currentSkillLevels === 5" 
                @apply-upgrade="costs => applyUpgrade(costs, 'SkillLevel', 6)"/>
        </div>
        <div class="row" v-if="ShowRow(Costs.skill[5])">
            <OperatorCostRow :costs="Costs.skill[5]" title="Skill 7 Costs"
                :enable-apply="selectedOperator.plans.currentSkillLevels === 6" 
                @apply-upgrade="costs => applyUpgrade(costs, 'SkillLevel', 7)"/>
        </div>

        <!-- Promotion and Level Up Costs -->

        <div class="row" v-if="ShowRow(Costs.promotion)">
            <OperatorCostRow :costs="Costs.promotion" title="Promotion Cost" :enable-apply="false" />
        </div>
        <div class="row" v-if="ShowRow(Costs.levelup)">
            <OperatorCostRow :costs="Costs.levelup" title="Level Up Cost" :enable-apply="false" />
        </div>
    </div>
</template>