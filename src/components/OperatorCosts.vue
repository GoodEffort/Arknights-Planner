<script setup lang="ts">
import { computed } from 'vue';
import { LevelUpCost, Module, Phase, Skill, UnlockCondition } from '../types/operator';
import { levelingCostsArray } from '../data/leveling-costs';
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import type { Item } from '../types/item';
import ItemCell from './ItemCell.vue';

const { items, expItems } = storeToRefs(usePlannerStore());

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


const levelingCosts = computed(() => {
    let currentLevelIndex = props.currentLevel;
    const targetLevelIndex = props.targetLevel - 1;
    let currentEliteIndex: number = props.currentElite;
    const targetEliteIndex: number = props.targetElite;

    let lmd = 0;
    let exp = 0;

    for (; currentEliteIndex <= targetEliteIndex; currentEliteIndex++) {
        const endLevel = currentEliteIndex < targetEliteIndex ? 
            props.eliteLevelUpCosts[currentEliteIndex].maxLevel - 1 :
            targetLevelIndex;

        for (; currentLevelIndex <= endLevel; currentLevelIndex++) {
            lmd += levelingCostsArray[currentEliteIndex][currentLevelIndex].lmd;
            exp += levelingCostsArray[currentEliteIndex][currentLevelIndex].exp;
        }
        
        currentLevelIndex = 0;
    }

    return { lmd, exp };
});

const skillCosts = computed(() => {
    const targetSkillIndex = props.targetSkill - 1;
    const neededItems: {
        item: Item;
        count: number;
    }[] = [];

    for (
        let currentSkillIndex = props.currentSkill - 1;
        currentSkillIndex < targetSkillIndex;
        currentSkillIndex++
    ) {
        const { lvlUpCost } = props.skillLevelUpCosts[currentSkillIndex];

        for (const { count, id } of lvlUpCost ?? []) {
            const item: Item = items.value[id];
            const existingItemCount = neededItems.find(i => i.item === item);
            if (existingItemCount) {
                existingItemCount.count += count;
            } else {
                neededItems.push({ item, count });
            }
        }
    }

    return neededItems.sort((a, b) => a.item.sortId - b.item.sortId);
});
</script>

<template>
    <div class="row">
        <div class="col">
            LMD {{ levelingCosts.lmd }}
            EXP {{ levelingCosts.exp }}
        </div>
    </div>
    <div class="row">
        <ItemCell v-for="{ item, count } in skillCosts" :item="item" :count="count" />
    </div>
</template>