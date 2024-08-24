import { levelingCostsArray } from "../data/leveling-costs";
import promotionLMDCosts from "../data/promotionCosts";
import { Item, Recipe } from "../types/outputdata";
import { LevelUpNeeds, LevelUpNeedsKey, SelectedOperator } from "../types/planner-types";

// key is item id, value is quantity
type Inventory = { [key: string]: number; };
type ItemWithRecipe = Item & { recipe: Recipe };
type EXPItem = Item & { gainExp: number; };

const isEXPItem = (item: Item): item is EXPItem => {
    return item.gainExp !== undefined;
}

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

const itemListToInventory = (itemList: { item: Item, count: number }[]) => {
    const inventory: Inventory = {};

    for (const { item, count } of itemList) {
        inventory[item.itemId] = count;
    }

    return inventory;
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
    let battleRecords: { gainExp: number; id: string; }[] = [];
    const expItemList = Object.values(items).filter(item => isEXPItem(item));

    for (let expItem of expItemList) {
        const gainExp: number = expItem.gainExp ?? 0;
        battleRecords.push({ gainExp, id: expItem.itemId });
    }

    return battleRecords.sort((a, b) => b.gainExp - a.gainExp);
}

const getLevelUpCosts = (selectedOperator: SelectedOperator, lmdId: string, battleRecords: ReturnType<typeof getBattleRecords>) => {
    const {
        currentElite,
        targetElite,
        currentLevel,
        targetLevel
    } = selectedOperator.plans;

    const { promotions } = selectedOperator.operator;

    const neededItems: Inventory = {};

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
        neededItems[lmdId] = lmd;
    }

    // calculate exp items needed
    for (const { gainExp, id } of battleRecords) {
        const recordsNeeded = Math.floor(exp / gainExp);
        exp = exp % gainExp;

        if (recordsNeeded > 0) {
            if (neededItems[id] === undefined) {
                neededItems[id] = 0;
            }

            neededItems[id] += recordsNeeded;
        }
    }

    if (exp > 0) {
        const lastExpItemId = battleRecords[battleRecords.length - 1].id;

        if (neededItems[lastExpItemId] === undefined) {
            neededItems[lastExpItemId] = 0;
        }

        neededItems[lastExpItemId] += 1;
    }

    return neededItems;
}

const getPromotionCosts = (selectedOperator: SelectedOperator, lmdId: string) => {
    const { currentElite, targetElite } = selectedOperator.plans;
    const { promotions, rarity } = selectedOperator.operator;

    const neededItems: { e1: Inventory; e2: Inventory } = {
        e1: {},
        e2: {}
    }

    const { ELITE_1, ELITE_2 } = promotionLMDCosts[rarity];

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

            neededItems.e1[lmdId] += ELITE_1;
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

            neededItems.e2[lmdId] += ELITE_2;
        }
    }

    return neededItems;
}

const getSkillLevelUpCosts = (selectedOperator: SelectedOperator) => {
    const {
        currentSkillLevels,
        targetSkillLevels,
    } = selectedOperator.plans;

    const {
        skillLevelUpCosts,
    } = selectedOperator.operator;

    const skill: Inventory[] = [];

    // skill level up costs
    for (
        let currentSkillIndex = currentSkillLevels - 1;
        currentSkillIndex < targetSkillLevels - 1;
        currentSkillIndex++
    ) {
        const lvlUpCost = skillLevelUpCosts[currentSkillIndex] ?? [];

        for (const { count, id } of lvlUpCost) {
            if (skill[currentSkillIndex] === undefined)
                skill[currentSkillIndex] = {};

            if (skill[currentSkillIndex][id] === undefined)
                skill[currentSkillIndex][id] = 0;

            skill[currentSkillIndex][id] += count;
        }
    }

    return skill;
}

const getSkillMasteryCosts = (selectedOperator: SelectedOperator) => {
    const { targetSkillMasteries, currentSkillMasteries } = selectedOperator.plans;
    const { skills } = selectedOperator.operator;

    const neededItems: { [key: string]: Inventory } = {
        s1m1: {},
        s1m2: {},
        s1m3: {},
        s2m1: {},
        s2m2: {},
        s2m3: {},
        s3m1: {},
        s3m2: {},
        s3m3: {}
    };

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

    return neededItems;
}

const getModuleCosts = (selectedOperator: SelectedOperator) => {
    const { currentModules, targetModules } = selectedOperator.plans;
    const { modules } = selectedOperator.operator;

    const neededItems: LevelUpNeeds['modules'] = {};

    // module costs
    for (const module of modules) {
        const moduleType = module.type.toLowerCase();

        const currentModuleLevel = currentModules.find(m => m.type.toLowerCase() === moduleType)?.level ?? 0;
        const targetModuleLevel = targetModules.find(m => m.type.toLowerCase() === moduleType)?.level ?? 0;

        const moduleCosts = module.cost;

        for (let moduleLevelIndex = currentModuleLevel; moduleLevelIndex < targetModuleLevel; moduleLevelIndex++) {
            const cost = moduleCosts[moduleLevelIndex];

            for (const { id: itemId, count } of cost) {
                let neededmodule = neededItems[module.type];

                if (neededmodule === undefined) {
                    neededItems[module.type] = [{}, {}, {}];
                    neededmodule = neededItems[module.type];
                }

                let neededModuleLevel = neededmodule[moduleLevelIndex];

                if (neededModuleLevel == null) {
                    neededItems[module.type][moduleLevelIndex] = {};
                    neededModuleLevel = neededItems[module.type][moduleLevelIndex];
                }

                if (neededModuleLevel != null && neededModuleLevel[itemId] == null) {
                    neededModuleLevel[itemId] = 0;
                }

                neededItems[module.type][moduleLevelIndex][itemId] += count;
            }
        }
    }

    return neededItems;
}

const getCostOfOperator = (selectedOperator: SelectedOperator, lmdId: string, battleRecords: ReturnType<typeof getBattleRecords>) => {
    const levelup = getLevelUpCosts(selectedOperator, lmdId, battleRecords);
    const { e1, e2 } = getPromotionCosts(selectedOperator, lmdId);
    const skill = getSkillLevelUpCosts(selectedOperator);
    const { s1m1, s1m2, s1m3, s2m1, s2m2, s2m3, s3m1, s3m2, s3m3 } = getSkillMasteryCosts(selectedOperator);
    const modules = getModuleCosts(selectedOperator);

    return { levelup, e1, e2, skill, s1m1, s1m2, s1m3, s2m1, s2m2, s2m3, s3m1, s3m2, s3m3, modules };
}

const getTotalCostsByOperator = (
    costsByOperator: { [key: string]: LevelUpNeeds; },
    getBlankInventory: () => Inventory
) => {
    const neededItemsByOperator: { [key: string]: { [key: string]: number } } = {};
    for (const [operatorId, levelUpNeeds] of Object.entries(costsByOperator)) {
        const neededItems: { [key: string]: number } = getBlankInventory();
        const addNeededItems = (costs: {
            [key: string]: number;
        }) => {
            for (const [id, count] of Object.entries(costs)) {
                neededItems[id] += count;
            }
        }

        for (const key in levelUpNeeds) {
            if (key === 'skill') {
                for (const skillCosts of levelUpNeeds.skill) {
                    if (skillCosts)
                        addNeededItems(skillCosts);
                }
            }
            else if (key === 'modules') {
                for (const moduleType in levelUpNeeds.modules) {
                    for (let levelIndex = 0; levelIndex < levelUpNeeds.modules[moduleType].length; levelIndex++) {
                        addNeededItems(levelUpNeeds.modules[moduleType][levelIndex]);
                    }
                }
            }
            else {
                addNeededItems(levelUpNeeds[key as LevelUpNeedsKey]);
            }
        }

        neededItemsByOperator[operatorId] = neededItems;
    }
    return neededItemsByOperator;

}

const getTotalCosts = (
    neededItems: Inventory, 
    totalCostsByOperator: { [key: string]: Inventory; },
    selectedOperators: SelectedOperator[],
) => {

    for (const [operatorId, items] of Object.entries(totalCostsByOperator)) {
        if (selectedOperators.find(c => c.operator.id === operatorId)?.active) {
            for (const [id, count] of Object.entries(items)) {
                neededItems[id] += count;
            }
        }
    }
    return neededItems;
}

const canCraft = (
    item: Item, 
    inventory: Inventory, 
    items?: { [key: string]: Item; }
 ): item is ItemWithRecipe => {
    if (item.recipe === undefined) {
        items === undefined ? null : alert(`Item ${item.name} cannot be crafted.`);
        return false;
    }
    
    // verify if we have enough items
    for (const { id, count } of item.recipe.costs) {
        if (inventory[id] < count) {
            items === undefined ? null : alert(`You don't have enough ${items[id].name} to craft ${item.name}.`);
            return false;
        }
    }

    return true;
}

const getReservedItems = (items: { [key: string]: Item; }, efficientToFarmItemIds: string[]) => {
    const reservedItems: Inventory = JSON.parse(localStorage.getItem('reservedItems') || '{}');

    // if we have previously saved reserved items, load them
    if (Object.keys(reservedItems).length > 0) {
        return reservedItems;
    }
    // else set the reserved items to the default values
    else {
        for (const [itemId, item] of Object.entries(items)) {
            if (
                (item.rarity === 'TIER_1' || item.rarity === 'TIER_2') &&
                efficientToFarmItemIds.indexOf(itemId) < 0
            ) {
                reservedItems[itemId] = 20;
            }
            else {
                reservedItems[itemId] = 0;
            }
        }
    }

    return reservedItems;
}

export {
    getEXPValue,
    getBattleRecords,
    getCostOfOperator,
    getTotalCostsByOperator,
    getTotalCosts,
    canCraft,
    itemListToInventory,
    inventoryToList,
    getReservedItems,
    isEXPItem,
}

export type {
    Inventory,
    ItemWithRecipe,
}