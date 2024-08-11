import { levelingCostsArray } from "../data/leveling-costs";
import promotionLMDCosts from "../data/promotionCosts";
import { Item } from "../types/outputdata";
import { LevelUpNeeds, SelectedOperator } from "../types/planner-types";

// key is item id, value is quantity
type Inventory = { [key: string]: number; };

const inventoryToList = (
    itemDictionary: Inventory,
    itemDefitions: { [key: string]: Item; }
) => {
    const list = [];
    for (const itemId in itemDictionary) {
        const item = itemDefitions[itemId];
        const count = itemDictionary[itemId];
        if (item) {
            list.push({
                item,
                count,
            });
        }
    }
    return list;
}

const getEXPValue = (
    inventory: Inventory | ReturnType<typeof inventoryToList>,
    items?: { [key: string]: Item; }
) => {
    const getEXPFromInvList =
        (inventory: ReturnType<typeof inventoryToList>) => inventory
            // filter out items that don't give EXP
            .filter(({ item }) => item.gainExp !== undefined && item.gainExp > 0)
            // map to EXP gain for each item * quantity
            .map(({ item, count }) => (item.gainExp ?? 0) * count)
            // sum up all EXP gains
            .reduce((acc, val) => acc + val, 0);

    if (Array.isArray(inventory)) {
        return getEXPFromInvList(inventory);
    }
    else if (items) {
        const invList = inventoryToList(inventory, items);
        return getEXPFromInvList(invList);
    }
    else {
        throw new Error('if inventory is an object, items must be provided');
    }
}

const getBattleRecords = (items: { [key: string]: Item; }) => {
    let br: { gainExp: number; id: string; }[] = [];
    for (let [_, expItem] of Object.entries(items)) {
        if (expItem.gainExp !== undefined)
            br.push({ gainExp: expItem.gainExp, id: expItem.itemId });
    }
    return br.sort((a, b) => b.gainExp - a.gainExp);
}

const getCostOfOperator = (selectedOperator: SelectedOperator, lmdId: string, battleRecords: ReturnType<typeof getBattleRecords>) => {
    const {
        currentElite,
        targetElite,
        currentLevel,
        targetLevel,
        currentSkillLevels,
        targetSkillLevels,
        targetSkillMasteries,
        currentSkillMasteries,
        currentModules,
        targetModules
    } = selectedOperator.plans;

    const {
        promotions,
        skillLevelUpCosts,
        skills,
        rarity
    } = selectedOperator.operator;

    const neededItems: LevelUpNeeds = {
        levelup: {},
        e1: {},
        e2: {},
        skill: [],
        s1m1: {},
        s1m2: {},
        s1m3: {},
        s2m1: {},
        s2m2: {},
        s2m3: {},
        s3m1: {},
        s3m2: {},
        s3m3: {},
        modules: {}
    };

    const promotionLMD = promotionLMDCosts[rarity];

    // level up costs

    let currentLevelIndex = currentLevel;
    let lmd = 0;
    let exp = 0;

    for (
        let currentEliteIndex = currentElite;
        currentEliteIndex <= targetElite;
        currentEliteIndex++
    ) {
        const maxLevel = promotions[currentEliteIndex].maxLevel;

        const endLevel = currentEliteIndex < targetElite ?
            promotions[currentEliteIndex].maxLevel :
            Math.min(maxLevel, targetLevel);

        for (; currentLevelIndex < endLevel; currentLevelIndex++) {
            const cost = levelingCostsArray[currentEliteIndex][currentLevelIndex]
            if (!cost) {
                debugger;
            }
            lmd += cost.lmd;
            exp += cost.exp;
        }

        currentLevelIndex = 0;
    }

    if (lmd > 0) {
        neededItems.levelup[lmdId] = lmd;
    }

    // calculate exp items needed
    for (const { gainExp, id } of battleRecords) {
        const recordsNeeded = Math.floor(exp / gainExp);
        exp = exp % gainExp;

        if (recordsNeeded > 0) {
            if (neededItems.levelup[id] === undefined) {
                neededItems.levelup[id] = 0;
            }

            neededItems.levelup[id] += recordsNeeded;
        }
    }

    if (exp > 0) {
        const lastExpItemId = battleRecords[battleRecords.length - 1].id;

        if (neededItems.levelup[lastExpItemId] === undefined) {
            neededItems.levelup[lastExpItemId] = 0;
        }

        neededItems.levelup[lastExpItemId] += 1;
    }

    // promotion costs

    // elite 1
    if (currentElite === 0 && targetElite >= 1) {
        const { evolveCost } = promotions[1];

        if (evolveCost) {
            for (const { count, id } of evolveCost) {
                if (neededItems.e1[id] === undefined)
                    neededItems.e1[id] = 0;

                neededItems.e1[id] += count;
            }

            if (neededItems.e1[lmdId] === undefined)
                neededItems.e1[lmdId] = 0;

            neededItems.e1[lmdId] += promotionLMD.ELITE_1;
        }
    }

    // elite 2
    if (currentElite <= 1 && targetElite === 2) {
        const { evolveCost } = promotions[2];

        if (evolveCost) {
            for (const { count, id } of evolveCost) {
                if (neededItems.e2[id] === undefined)
                    neededItems.e2[id] = 0;

                neededItems.e2[id] += count;
            }

            if (neededItems.e2[lmdId] === undefined)
                neededItems.e2[lmdId] = 0;

            neededItems.e2[lmdId] += promotionLMD.ELITE_2;
        }
    }

    // skill level up costs
    for (
        let currentSkillIndex = currentSkillLevels - 1;
        currentSkillIndex < targetSkillLevels - 1;
        currentSkillIndex++
    ) {
        const lvlUpCost = skillLevelUpCosts[currentSkillIndex] ?? [];

        for (const { count, id } of lvlUpCost) {
            if (neededItems.skill[currentSkillIndex] === undefined)
                neededItems.skill[currentSkillIndex] = {};

            const skill = neededItems.skill[currentSkillIndex];
            if (skill[id] === undefined)
                skill[id] = 0;

            skill[id] += count;
        }
    }

    // mastery costs
    for (let skillIndex = 0; skillIndex < skills.length; skillIndex++) {
        const { masteryCosts } = skills[skillIndex];
        const skillKey = 'skill' + (skillIndex + 1) as 'skill1' | 'skill2' | 'skill3';
        const currentSkillMastery = currentSkillMasteries[skillKey];
        const targetSkillMastery = targetSkillMasteries[skillKey];

        for (let masteryIndex = currentSkillMastery; masteryIndex < targetSkillMastery; masteryIndex++) {

            const skillMasteryName = `s${skillIndex + 1}m${masteryIndex + 1}` as 's1m1' | 's1m2' | 's1m3' | 's2m1' | 's2m2' | 's2m3' | 's3m1' | 's3m2' | 's3m3';
            const cost = masteryCosts[masteryIndex];

            for (const { id: itemId, count } of cost) {
                if (neededItems[skillMasteryName][itemId] === undefined) {
                    neededItems[skillMasteryName][itemId] = 0;
                }

                neededItems[skillMasteryName][itemId] += count;
            }
        }
    }

    // module costs
    for (const module of selectedOperator.operator.modules) {
        const moduleType = module.type.toLowerCase();

        const currentModuleLevel = currentModules.find(m => m.type.toLowerCase() === moduleType)?.level ?? 0;
        const targetModuleLevel = targetModules.find(m => m.type.toLowerCase() === moduleType)?.level ?? 0;

        const moduleCosts = module.cost;

        for (let moduleLevelIndex = currentModuleLevel; moduleLevelIndex < targetModuleLevel; moduleLevelIndex++) {
            const cost = moduleCosts[moduleLevelIndex];

            for (const { id: itemId, count } of cost) {
                let neededmodule = neededItems.modules[module.type];

                if (neededmodule === undefined) {
                    neededItems.modules[module.type] = [{}, {}, {}];
                    neededmodule = neededItems.modules[module.type];
                }

                let neededModuleLevel = neededmodule[moduleLevelIndex];

                if (neededModuleLevel == null) {
                    neededItems.modules[module.type][moduleLevelIndex] = {};
                    neededModuleLevel = neededItems.modules[module.type][moduleLevelIndex];
                }

                if (neededModuleLevel != null && neededModuleLevel[itemId] == null) {
                    neededModuleLevel[itemId] = 0;
                }

                neededItems.modules[module.type][moduleLevelIndex][itemId] += count;
            }
        }
    }

    return neededItems;
}

export {
    getEXPValue,
    getBattleRecords,
    getCostOfOperator,
}

export type {
    Inventory
}