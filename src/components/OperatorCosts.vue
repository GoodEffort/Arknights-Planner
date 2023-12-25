<script setup lang="ts">
import { computed } from 'vue';
import { LevelUpCost, Module, Phase, Skill, UnlockCondition } from '../types/operator';
import { levelingCostsArray } from '../data/leveling-costs';
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import type { ExpItem, Item } from '../types/item';
import ItemCell from './ItemCell.vue';

const { items, expItems } = storeToRefs(usePlannerStore());

let battleRecords: ExpItem[] = [];

for (let [_, expItem] of Object.entries(expItems.value)) {
    battleRecords.push(expItem);
}

battleRecords = battleRecords.sort((a, b) => b.gainExp - a.gainExp);

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

    const neededItems: {
        item: Item;
        count: number;
    }[] = [];

    if (lmd > 0)
        neededItems.push({ item: items.value["4001"], count: lmd });

    for (const { gainExp, id } of battleRecords) {
        const recordsNeeded = Math.floor(exp / gainExp);
        exp = exp % gainExp;

        if (recordsNeeded > 0)
            neededItems.push({ item: items.value[id], count: recordsNeeded });
    }

    if (exp > 0) {
        neededItems.push({ item: items.value["2001"], count: 1 });
    }

    return neededItems;
});

// const promotionCosts

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

    return neededItems;
});

const getMasteryCost = (targetMasteryIndex: number, currentMastery: number, skillMasteryCosts: Skill) => {
    const neededItems: {
        item: Item;
        count: number;
    }[] = [];

    for (
        let currentMasteryIndex = currentMastery;
        currentMasteryIndex < targetMasteryIndex + 1;
        currentMasteryIndex++
    ) {
        const { levelUpCost } = skillMasteryCosts.levelUpCostCond[currentMasteryIndex];

        for (const { count, id } of levelUpCost ?? []) {
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
}

const mastery1Costs = computed(() => {
    const skillMasteryCosts = props.skillMasteryCosts[0];

    if (!skillMasteryCosts) {
        return [];
    }
    else {
        return getMasteryCost(props.targetMastery1 - 1, props.currentMastery1, skillMasteryCosts);
    }
});

const mastery2Costs = computed(() => {
    const skillMasteryCosts = props.skillMasteryCosts[1];

    if (!skillMasteryCosts) {
        return [];
    }
    else {
        return getMasteryCost(props.targetMastery2 - 1, props.currentMastery2, skillMasteryCosts);
    }
});

const mastery3Costs = computed(() => {
    const skillMasteryCosts = props.skillMasteryCosts[2];

    if (!skillMasteryCosts) {
        return [];
    }
    else {
        return getMasteryCost(props.targetMastery3 - 1, props.currentMastery3, skillMasteryCosts);
    }
});

// const moduleXCosts

// const moduleYCosts

// const moduleZCosts

const totalCosts = computed(() => {

    const neededItems: {
        item: Item;
        count: number;
    }[] = skillCosts.value.slice();

    for (const { item, count } of mastery1Costs.value) {
        const existingItemCount = neededItems.find(i => i.item === item);
        if (existingItemCount) {
            existingItemCount.count += count;
        } else {
            neededItems.push({ item, count });
        }
    }

    for (const { item, count } of mastery2Costs.value) {
        const existingItemCount = neededItems.find(i => i.item === item);
        if (existingItemCount) {
            existingItemCount.count += count;
        } else {
            neededItems.push({ item, count });
        }
    }

    for (const { item, count } of mastery3Costs.value) {
        const existingItemCount = neededItems.find(i => i.item === item);
        if (existingItemCount) {
            existingItemCount.count += count;
        } else {
            neededItems.push({ item, count });
        }
    }

    for (const { item, count } of levelingCosts.value) {
        const existingItemCount = neededItems.find(i => i.item === item);
        if (existingItemCount) {
            existingItemCount.count += count;
        } else {
            neededItems.push({ item, count });
        }
    }

    return neededItems.sort((a, b) => a.item.sortId - b.item.sortId);
});
</script>

<template>
    <div class="row">
        <ItemCell v-for="{ item, count } in totalCosts" :item="item" :count="count" />
    </div>
</template>