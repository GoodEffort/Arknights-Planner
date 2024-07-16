import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import type { Operator, CharEquip, EquipDict, Module, Skill, LevelUpNeeds, LevelUpNeedsKey } from '../types/operator';
import { SelectedOperator, SaveRecord } from '../types/operator';
import getChardata from '../data/chardata';
import getModuledata from '../data/moduledata';
import getItemdata from '../data/itemdata';
import { ExpItem, Item } from '../types/item';
import { debounce } from 'lodash';
import { levelingCostsArray } from '../data/leveling-costs';
import promotionLMDCosts from '../data/promotionCosts';
import getBuildingdata from '../data/buildingdata';
import { dualchips, efficientToFarmItemIds, stages } from '../data/farmingdata';

export const usePlannerStore = defineStore('planner', () => {
    const operators = ref<Operator[]>([]);
    const modules = ref<EquipDict>({});
    const charactersToModules = ref<CharEquip>({});
    const selectedOperators = ref<SelectedOperator[]>([]);
    const expItems = ref<{ [key: string]: ExpItem }>({});
    const items = ref<{ [key: string]: Item }>({});
    const recipes = ref<{
        [key: string]: {
            id: string;
            count: number;
            type: string;
        }[]
    }>({});
    const lmdId = ref<string>('4001'); // this should be constant
    const reserveTier1 = ref<number>(0);
    const reserveTier2 = ref<number>(0);
    const reserveTier3 = ref<number>(0);
    const reserveTier4 = ref<number>(0);
    const reserveTier5 = ref<number>(0);
    const reserveTier6 = ref<number>(0);
    const exportString = ref<string>('');

    // Operators
    async function loadCharacters() {
        const data = await getChardata();
        operators.value = data;
    }

    async function loadModules() {
        const { ModuleDict, CharacterModules } = await getModuledata();
        modules.value = ModuleDict;
        charactersToModules.value = CharacterModules;
    }

    async function loadItems() {
        const { itemsObj, expItemsObj } = await getItemdata();

        for (const key in itemsObj) {
            const item = itemsObj[key];
            item.buildingProductList = item.buildingProductList.filter(b => dualchips.indexOf(item.itemId) >= 0 || b.roomType === 'WORKSHOP');
        }

        items.value = itemsObj;
        expItems.value = expItemsObj;
        const currentInventory = JSON.parse(JSON.stringify(inventory.value)); // don't modify the original inventory
        inventory.value = { ...getBlankInventory(), ...currentInventory };
    }

    async function loadWorkshopFormulas() {
        const data = await getBuildingdata();
        recipes.value = data;
    }

    function getModulesForCharacter(operatorId: string): Module[] {
        const moduleIds = charactersToModules.value[operatorId] || [];
        const modulesArray: Module[] = [];
        for (const moduleId of moduleIds) {
            const module = modules.value[moduleId];
            if (module && module.type !== 'INITIAL') {
                modulesArray.push(module);
            }
        }
        return modulesArray;
    }

    function exportSavedRecords() {
        const selectedCharacters = selectedOperators.value.map(c => c.operator.id);
        const currentInventory = Object.fromEntries(Object.entries(inventory.value).filter(b => b[1] > 0));
        const operatorPlans: SaveRecord[] = [];

        for (const { operator, plans, active } of selectedOperators.value) {
            const saveRecord: SaveRecord = {
                operatorId: operator.id,
                plans,
                active
            };
            operatorPlans.push(saveRecord);
        }

        const exportData = {
            s: selectedCharacters,
            i: currentInventory,
            p: operatorPlans
        };

        console.log(exportData);
        exportString.value = JSON.stringify(exportData);
    }

    function loadSavedRecords() {
        const saveData: string | null = localStorage.getItem('selectedCharacters');
        if (saveData) {
            const operatorIds: string[] = JSON.parse(saveData);

            for (const operatorId of operatorIds) {

                const saveRecord = getSavedOperatorData(operatorId) || new SelectedOperator(operators.value.find(c => c.id === operatorId)!, getModulesForCharacter(operatorId));
                selectedOperators.value.push(saveRecord);
            }
        }
    }

    function getSavedOperatorData(operatorId: string): SelectedOperator {
        const saveString = `plans-${operatorId}`;
        const saveData: string | null = localStorage.getItem(saveString);
        const operator = operators.value.find(c => c.id === operatorId);
        const modulesarray = getModulesForCharacter(operatorId);

        if (operator === undefined) {
            throw new Error(`Operator with id ${operatorId} not found.`);
        }

        let selectedOperator: SelectedOperator;

        if (saveData) {
            const SaveRecord: SaveRecord = JSON.parse(saveData);
            selectedOperator = new SelectedOperator(operator, modulesarray, SaveRecord.plans, SaveRecord.active);
        }
        else {
            selectedOperator = new SelectedOperator(operator, modulesarray);
            localStorage.setItem(saveString, JSON.stringify(new SaveRecord(selectedOperator)));
        }

        return selectedOperator
    }

    function selectCharacter(character: Operator) {
        const existingSelection = selectedOperators.value.find(c => c.operator === character);
        if (existingSelection === undefined) {
            const newOperatorSelection = getSavedOperatorData(character.id);
            selectedOperators.value.push(newOperatorSelection);
        }
        else if (confirm(`Are you sure you want to remove ${character.name} from your selection?`)) {
            selectedOperators.value.splice(selectedOperators.value.indexOf(existingSelection), 1);
        }

        localStorage.setItem('selectedCharacters', JSON.stringify(selectedOperators.value.map(c => c.operator.id)));

        console.log(character);
    }

    // Costs
    const battleRecords = computed<ExpItem[]>(() => {
        let br = [];
        for (let [_, expItem] of Object.entries(expItems.value)) {
            br.push(expItem);
        }
        return br.sort((a, b) => b.gainExp - a.gainExp);
    });

    const getMasteryCost = (neededItems: { [key: string]: number }, targetMasteryIndex: number, currentMastery: number, skillMasteryCosts: Skill) => {
        for (
            let currentMasteryIndex = currentMastery;
            currentMasteryIndex < targetMasteryIndex;
            currentMasteryIndex++
        ) {
            const lucc = skillMasteryCosts.levelUpCostCond[currentMasteryIndex];

            if (lucc) {
                const { levelUpCost } = lucc;

                for (const { count, id } of levelUpCost ?? []) {
                    if (neededItems[id] === undefined) {
                        neededItems[id] = 0;
                    }

                    neededItems[id] += count;
                }
            }
        }
    }

    const getMasteryCostForSkill = (skillMasteryCosts: Skill, skillNumber: 1 | 2 | 3, neededItems: LevelUpNeeds, target: number, current: number) => {
        for (let skillIndex: 1 | 2 | 3 = 1; skillIndex <= 3; skillIndex++) {
            if (current < skillIndex && target >= skillIndex) {
                const skillMasteryName = `s${skillNumber}m${skillIndex}` as 's1m1' | 's1m2' | 's1m3' | 's2m1' | 's2m2' | 's2m3' | 's3m1' | 's3m2' | 's3m3';
                getMasteryCost(neededItems[skillMasteryName], skillIndex, skillIndex - 1, skillMasteryCosts)
            }
        }
    }

    const getModuleCostsByLevel = (neededItems: LevelUpNeeds, currentModule: number, targetModule: number, module: Module) => {
        const { typeName2: moduleLetter } = module;

        for (let moduleIndex = 1; moduleIndex <= 3; moduleIndex++) {
            if (currentModule < moduleIndex && targetModule >= moduleIndex) {
                const moduleName = `m${moduleLetter?.toLowerCase()}l${moduleIndex}` as 'mxl1' | 'mxl2' | 'mxl3' | 'myl1' | 'myl2' | 'myl3' | 'mdl1' | 'mdl2' | 'mdl3';

                if (neededItems[moduleName] === undefined) {
                    neededItems[moduleName] = {};
                }

                const strIndex = moduleIndex.toString() as '1' | '2' | '3';
                const itemCosts = module.itemCost[strIndex];

                for (const { count, id } of itemCosts) {
                    if (neededItems[moduleName][id] === undefined) {
                        neededItems[moduleName][id] = 0;
                    }

                    neededItems[moduleName][id] += count;
                }
            }
        }
    }

    const getBlankInventory = () => {
        const neededItems: { [key: string]: number } = {};

        for (const itemId in items.value) {
            neededItems[itemId] = 0;
        }

        return neededItems;
    }

    const totalCostsByOperatorCategorized = computed(() => {
        const neededItemsByOperator: { [key: string]: LevelUpNeeds } = {};

        for (const selectedOperator of selectedOperators.value) {
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
                phases: eliteLevelUpCosts,
                allSkillLvlup: skillLevelUpCosts,
                skills: skillMasteryCosts,
                id: operatorId,
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
                mxl1: {},
                mxl2: {},
                mxl3: {},
                myl1: {},
                myl2: {},
                myl3: {},
                mdl1: {},
                mdl2: {},
                mdl3: {},
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
                const maxLevel = eliteLevelUpCosts[currentEliteIndex].maxLevel;

                const endLevel = currentEliteIndex < targetElite ?
                    eliteLevelUpCosts[currentEliteIndex].maxLevel :
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
                neededItems.levelup[lmdId.value] = lmd;
            }

            // calculate exp items needed
            for (const { gainExp, id } of battleRecords.value) {
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
                const lastExpItemId = battleRecords.value[battleRecords.value.length - 1].id;

                if (neededItems.levelup[lastExpItemId] === undefined) {
                    neededItems.levelup[lastExpItemId] = 0;
                }

                neededItems.levelup[lastExpItemId] += 1;
            }

            // promotion costs

            // elite 1
            if (currentElite === 0 && targetElite >= 1) {
                const { evolveCost } = eliteLevelUpCosts[1];

                if (evolveCost) {
                    for (const { count, id } of evolveCost) {
                        if (neededItems.e1[id] === undefined)
                            neededItems.e1[id] = 0;

                        neededItems.e1[id] += count;
                    }

                    if (neededItems.e1[lmdId.value] === undefined)
                        neededItems.e1[lmdId.value] = 0;

                    neededItems.e1[lmdId.value] += promotionLMD.ELITE_1;
                }
            }

            // elite 2
            if (currentElite <= 1 && targetElite === 2) {
                const { evolveCost } = eliteLevelUpCosts[2];

                if (evolveCost) {
                    for (const { count, id } of evolveCost) {
                        if (neededItems.e2[id] === undefined)
                            neededItems.e2[id] = 0;

                        neededItems.e2[id] += count;
                    }

                    if (neededItems.e2[lmdId.value] === undefined)
                        neededItems.e2[lmdId.value] = 0;

                    neededItems.e2[lmdId.value] += promotionLMD.ELITE_2;
                }
            }

            // skill level up costs
            for (
                let currentSkillIndex = currentSkillLevels - 1;
                currentSkillIndex < targetSkillLevels - 1;
                currentSkillIndex++
            ) {
                const sluc = skillLevelUpCosts[currentSkillIndex];

                if (sluc) {
                    const { lvlUpCost } = sluc;
                    if (lvlUpCost) {
                        for (const { count, id } of lvlUpCost) {
                            if (neededItems.skill[currentSkillIndex] === undefined)
                                neededItems.skill[currentSkillIndex] = {};

                            const skill = neededItems.skill[currentSkillIndex];
                            if (skill[id] === undefined)
                                skill[id] = 0;

                            skill[id] += count;
                        }
                    }
                }
            }

            // mastery costs
            const skill1MasteryCosts = skillMasteryCosts[0];
            const skill2MasteryCosts = skillMasteryCosts[1];
            const skill3MasteryCosts = skillMasteryCosts[2];

            if (skill1MasteryCosts) {
                getMasteryCostForSkill(skill1MasteryCosts, 1, neededItems, targetSkillMasteries.skill1, currentSkillMasteries.skill1);
            }
            if (skill2MasteryCosts) {
                getMasteryCostForSkill(skill2MasteryCosts, 2, neededItems, targetSkillMasteries.skill2, currentSkillMasteries.skill2);
            }
            if (skill3MasteryCosts) {
                getMasteryCostForSkill(skill3MasteryCosts, 3, neededItems, targetSkillMasteries.skill3, currentSkillMasteries.skill3);
            }

            // module costs
            const moduleX = selectedOperator.modules.find(m => m.typeName2 === 'X');
            const moduleY = selectedOperator.modules.find(m => m.typeName2 === 'Y');
            const moduleD = selectedOperator.modules.find(m => m.typeName2 === 'D');

            if (moduleX) {
                getModuleCostsByLevel(neededItems, currentModules.x, targetModules.x, moduleX);
            }
            if (moduleY) {
                getModuleCostsByLevel(neededItems, currentModules.y, targetModules.y, moduleY);
            }
            if (moduleD) {
                getModuleCostsByLevel(neededItems, currentModules.d, targetModules.d, moduleD);
            }

            neededItemsByOperator[operatorId] = neededItems;
        }

        return neededItemsByOperator;
    });

    const totalCostsByOperator = computed(() => {
        const neededItemsByOperator: { [key: string]: { [key: string]: number } } = {};
        for (const [operatorId, levelUpNeeds] of Object.entries(totalCostsByOperatorCategorized.value)) {
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
                else {
                    addNeededItems(levelUpNeeds[key as LevelUpNeedsKey]);
                }
            }

            neededItemsByOperator[operatorId] = neededItems;
        }
        return neededItemsByOperator;
    });

    const totalCosts = computed(() => {
        const neededItems = getBlankInventory();

        for (const [operatorId, items] of Object.entries(totalCostsByOperator.value)) {
            if (selectedOperators.value.find(c => c.operator.id === operatorId)?.active) {
                for (const [id, count] of Object.entries(items)) {
                    neededItems[id] += count;
                }
            }
        }
        return neededItems;
    });

    // Inventory
    const inventory = ref<{ [key: string]: number }>(
        {
            ...getBlankInventory(),
            ...(JSON.parse(localStorage.getItem('inventory') || '{}'))
        }
    );

    const craftItem = (item: Item) => {
        const { itemId } = item;
        const costs = recipes.value[itemId];

        // verify if we have enough items
        for (const { id, count } of costs) {
            if (inventory.value[id] < count) {
                alert(`You don't have enough ${items.value[id].name} to craft ${item.name}.`);
                return;
            }
        }

        // remove items from inventory
        for (const { id, count } of costs) {
            inventory.value[id] -= count;
        }

        // add crafted item to inventory
        inventory.value[itemId] += 1;
    }

    watch(inventory, debounce((value: {
        [key: string]: number;
    }) => {
        localStorage.setItem('inventory', JSON.stringify(value));
    }, 250), { deep: true });

    // Needed Items

    const neededItems = computed(() => {
        const needed: { item: Item, count: number }[] = [];

        for (const key in totalCosts.value) {
            const count = totalCosts.value[key] - (inventory.value[key] ?? 0);
            if (count > 0) {
                const item = items.value[key];
                needed.push({ item, count });
            }
        }

        return needed.sort((a, b) => a.item.sortId - b.item.sortId);
    });

    const neededItemsBreakdown = computed(() => {
        const totalCostDict = totalCosts.value;
        const currentInventory = JSON.parse(JSON.stringify(inventory.value)); // don't modify the original inventory
        const breakdownCosts: { [key: string]: number } = {};

        const stopItems = efficientToFarmItemIds;
        stopItems.push(...Object.keys(expItems.value));

        const subtractFromInventory = (neededCount: number, id: string) => {
            let currentCount = currentInventory[id] || 0;

            // if we have some of the item, we don't need to farm it
            if (currentCount > 0) {
                // keep track of how much we have left for other items
                neededCount -= currentCount;
                // less than 0 in the current inventory doesn't matter as it is treated as 0 for this function
                currentInventory[id] = -1 * neededCount;
            }

            // return the amount we still need to farm, or 0 if we have enough
            return neededCount < 0 ? 0 : neededCount;
        }

        const breakdownItem = (neededCount: number, itemId: string) => {
            neededCount = subtractFromInventory(neededCount, itemId);

            if (neededCount > 0) {
                // and we should not breakdown the item
                const { rarity } = items.value[itemId];
                const recipe = itemId === "32001" ? [{
                    id: "4006",
                    count: 90,
                    type: ""
                }] : recipes.value[itemId];

                if (
                    !dualchips.includes(itemId) && (
                        stopItems.includes(itemId) ||
                        rarity === "TIER_1" ||
                        rarity === "TIER_2" ||
                        recipe === undefined ||
                        recipe.length === 0)
                ) {
                    if (breakdownCosts[itemId] === undefined) {
                        breakdownCosts[itemId] = 0;
                    }
                    // add it to the breakdown
                    breakdownCosts[itemId] += neededCount;
                }
                // otherwise we need to break it down
                else {
                    for (const { id: recipeItemId, count: recipeCount } of recipe) {
                        breakdownItem(recipeCount * neededCount, recipeItemId);
                    }
                }
            }
        };

        for (const key in totalCostDict) {
            breakdownItem(totalCostDict[key], key);
        }

        const costs: { item: Item, count: number }[] = [];

        for (const [key, value] of Object.entries(breakdownCosts)) {
            costs.push({ item: items.value[key], count: value });
        }

        return costs.sort((a, b) => a.item.sortId - b.item.sortId);
    });

    const recomendedStages = computed(() =>
        neededItemsBreakdown.value
            .filter(({ item: { itemId } }) => stages[itemId])
            .sort((a, b) =>
                ((efficientToFarmItemIds.indexOf(a.item.itemId) >= 0) === (efficientToFarmItemIds.indexOf(b.item.itemId) >= 0)) ?
                    b.item.sortId - a.item.sortId :
                    efficientToFarmItemIds.indexOf(b.item.itemId) - efficientToFarmItemIds.indexOf(a.item.itemId))
            .map(({ item }) => ({ stage: stages[item.itemId], item })));

    return {
        items,
        operators,
        modules,
        expItems,
        lmdId,
        selectedOperators,
        inventory,
        totalCosts,
        totalCostsByOperator,
        totalCostsByOperatorCategorized,
        battleRecords,
        neededItems,
        neededItemsBreakdown,
        recipes,
        reserveTier1,
        reserveTier2,
        reserveTier3,
        reserveTier4,
        reserveTier5,
        reserveTier6,
        recomendedStages,
        loadCharacters,
        loadModules,
        loadItems,
        loadSavedRecords,
        selectCharacter,
        craftItem,
        loadWorkshopFormulas,
        exportSavedRecords,
        getBlankInventory,
        exportString
    }
});