<script setup lang="ts">
import { computed } from 'vue';
import { LevelUpCost, Module, Phase, Skill, UnlockCondition } from '../types/operator';
import { levelingCostsArray } from '../data/leveling-costs';

const props = defineProps<{
    targetElite: 0 | 1 | 2;
    currentElite: 0 | 1 | 2;
    targetLevel: number;
    currentLevel: number;
    currentSkill: number;
    targetSkill: number;
    currentMastery1: number;
    currentMastery2: number;
    currentMastery3: number;
    targetMastery1: number;
    targetMastery2: number;
    targetMastery3: number;
    currentModuleX: number;
    currentModuleY: number;
    currentModuleZ: number;
    targetModuleX: number;
    targetModuleY: number;
    targetModuleZ: number;
    eliteLevelUpCosts: Phase[];
    skillLevelUpCosts: {
        unlockCond: UnlockCondition;
        lvlUpCost: LevelUpCost[] | null;
    }[];
    skillMasteryCosts: Skill[];
    modules: Module[];
}>();

const {
    eliteLevelUpCosts
} = props;


const levelingCosts = computed(() => {
    let currentLevelIndex = props.currentLevel;
    const targetLevelIndex = props.targetLevel - 1;
    let currentEliteIndex: number = props.currentElite;
    const targetEliteIndex: number = props.targetElite;

    let lmd = 0;
    let exp = 0;

    for (; currentEliteIndex <= targetEliteIndex; currentEliteIndex++) {
        const endLevel = currentEliteIndex < targetEliteIndex ? 
            eliteLevelUpCosts[currentEliteIndex].maxLevel - 1 :
            targetLevelIndex;

        for (; currentLevelIndex <= endLevel; currentLevelIndex++) {
            lmd += levelingCostsArray[currentEliteIndex][currentLevelIndex].lmd;
            exp += levelingCostsArray[currentEliteIndex][currentLevelIndex].exp;
        }
        
        currentLevelIndex = 0;
    }

    return { lmd, exp };
});



</script>

<template>
    <div class="col">
        LMD {{ levelingCosts.lmd }}
        EXP {{ levelingCosts.exp }}
    </div>
</template>