import { getEXPValue, Inventory } from './store-functions';
import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { SelectedOperator, OldSaveRecord, LevelUpNeeds, LevelUpNeedsKey, SaveRecord, IsOldSaveRecord } from '../types/planner-types';
import { debounce } from 'lodash';
import { levelingCostsArray } from '../data/leveling-costs';
import promotionLMDCosts from '../data/promotionCosts';
import { efficientToFarmItemIds, farmingChips, stages } from '../data/farmingdata';
import type { Item, Operator } from '../types/outputdata';
import DriveClient from '../api/google-drive-api';
import { clientId, scope } from '../data/authInfo';
import { localeCompare } from '../data/operatorNameCompare';
import { getBlankInventoryFromItems, getArknightsData, getExportData, setImportData } from './store-operator-functions';
//import { clientId, scope } from '../data/devauthinfo';

export const usePlannerStore = defineStore('planner', () => {
    // Getters
    const getBlankInventory = () => getBlankInventoryFromItems(items.value);
    const exportSavedRecords = () => getExportData(selectedOperators.value, inventory.value);
    const getInventoryCopy = () => JSON.parse(JSON.stringify(inventory.value)); // don't modify the original inventory

    // State
    let driveClient: DriveClient;

    const operators = ref<Operator[]>([]);
    const selectedOperators = ref<SelectedOperator[]>([]);
    const items = ref<{ [key: string]: Item }>({});
    const lmdId = ref<string>('4001'); // this should be constant

    const googleDriveTest = ref<boolean>(localStorage.getItem("GoogleDriveTest") === "1");
    
    const inventory = ref<Inventory>(
        {
            ...getBlankInventory(),
            ...(JSON.parse(localStorage.getItem('inventory') || '{}'))
        }
    );

    // Operators
    async function loadCharacters() {
        const data = await getArknightsData();

        operators.value = data.operators;
        items.value = data.items;

        const currentInventory = getInventoryCopy();

        inventory.value = {
            ...getBlankInventory(),
            ...currentInventory
        };
    }

    function importSavedRecords(importString: string) {
        setImportData(importString);
    }

    function loadSavedRecords() {

        const inventoryData: Inventory = JSON.parse(localStorage.getItem('inventory') || '{}');

        inventory.value = { ...getBlankInventory(), ...inventoryData };

        selectedOperators.value = [];

        const saveData: string | null = localStorage.getItem('selectedCharacters');
        if (saveData) {
            const operatorIds: string[] = JSON.parse(saveData);

            for (const operatorId of operatorIds) {
                const operator = operators.value.find(c => c.id === operatorId);

                if (operator === undefined) {
                    throw new Error(`Operator with id ${operatorId} not found.`);
                }

                const saveRecord = getSavedOperatorData(operatorId) || new SelectedOperator(operator);
                //console.log(saveRecord);
                if (selectedOperators.value.find(c => c.operator.id === operatorId) === undefined)
                    selectedOperators.value.push(saveRecord); // only add if it doesn't already exist, Vite is duplicating entries in dev mode
            }

            let sortVal = null;
            for (const op of selectedOperators.value) {
                if (sortVal === null) {
                    sortVal = op.sort;
                }
                else if (sortVal !== op.sort) {
                    sortVal = null;
                    break;
                }
            }

            if (sortVal !== null) {
                bringActiveToTop();
            }
        }
    }

    function getSavedOperatorData(operatorId: string): SelectedOperator {
        const saveString = `plans-${operatorId}`;
        const saveData: string | null = localStorage.getItem(saveString);
        const operator = operators.value.find(c => c.id === operatorId);

        if (operator === undefined) {
            throw new Error(`Operator with id ${operatorId} not found.`);
        }

        let selectedOperator: SelectedOperator;

        if (saveData) {
            const SaveRecord: OldSaveRecord | SaveRecord = JSON.parse(saveData);
            let sort = 9999999999999;
            if (!IsOldSaveRecord(SaveRecord))
                sort = SaveRecord.sort;
            selectedOperator = new SelectedOperator(operator, SaveRecord.plans, SaveRecord.active, sort);
        }
        else {
            selectedOperator = new SelectedOperator(operator);
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

        //console.log(character);
    }

    const bringActiveToTop = () => {
        const bringInactiveToTopSort = (a: SelectedOperator, b: SelectedOperator) => {
            if (a.active === b.active) {
                return localeCompare(a.operator.name, b.operator.name);
            }
            return a.active ? -1 : 1;
        };

        const ops = selectedOperators.value
            .slice()
            .sort(bringInactiveToTopSort);

        selectedOperators.value = [];

        for (const op of ops) {
            op.sort = ops.indexOf(op);
        }

        selectedOperators.value = ops;
    }

    // Costs
    const battleRecords = computed(() => {
        let br: { gainExp: number; id: string; }[] = [];
        for (let [_, expItem] of Object.entries(items.value)) {
            if (expItem.gainExp !== undefined)
                br.push({ gainExp: expItem.gainExp, id: expItem.itemId });
        }
        return br.sort((a, b) => b.gainExp - a.gainExp);
    });

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
                promotions,
                skillLevelUpCosts,
                skills,
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
                const { evolveCost } = promotions[1];

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
                const { evolveCost } = promotions[2];

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

    const totalEXPValueCost = computed(() => getEXPValue(totalCosts.value));

    // Inventory

    const inventoryEXPValue = computed(() => getEXPValue(inventory.value));

    const craftItem = (item: Item) => {
        if (item.recipe === undefined) {
            alert(`Item ${item.name} cannot be crafted.`);
            return;
        }

        const { itemId } = item;
        const { count: outputCount, costs } = item.recipe;

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
        inventory.value[itemId] += outputCount;
    }

    // Needed Items
    const neededEXPItems = computed(() => {
        const needed: { item: Item, count: number }[] = [];

        let neededEXP = totalEXPValueCost.value - inventoryEXPValue.value;
        if (neededEXP > 0) {
            for (const { id, gainExp } of battleRecords.value) {
                const count = Math.floor(neededEXP / gainExp);
                neededEXP = neededEXP % gainExp;
                if (count > 0) {
                    needed.push({ item: items.value[id], count });
                }
            }
        }

        if (neededEXP > 0) {
            const lastExpItemId = battleRecords.value[battleRecords.value.length - 1].id;
            if (needed.find(n => n.item.itemId === lastExpItemId)) {
                needed.find(n => n.item.itemId === lastExpItemId)!.count += 1;
            }
            else {
                needed.push({ item: items.value[lastExpItemId], count: 1 });
            }
        }

        return needed;
    });

    const neededItems = computed(() => {
        const needed: { item: Item, count: number }[] = [];

        for (const key in totalCosts.value) {
            if (battleRecords.value.find(b => b.id === key)) {
                continue;
            }
            const count = totalCosts.value[key] - (inventory.value[key] ?? 0);
            if (count > 0) {
                const item = items.value[key];
                needed.push({ item, count });
            }
        }

        needed.push(...neededEXPItems.value);

        return needed.sort((a, b) => a.item.sortId - b.item.sortId);
    });

    const neededItemsBreakdown = computed(() => {
        const totalCostDict = totalCosts.value;
        const currentInventory = getInventoryCopy();
        const breakdownCosts: { [key: string]: number } = {};

        const stopItems = efficientToFarmItemIds;
        stopItems.push(...Object.keys(battleRecords.value));

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
                const item = items.value[itemId];
                // and we should not breakdown the item
                if (
                    stopItems.indexOf(itemId) >= 0 ||
                    item.recipe === undefined
                ) {
                    if (breakdownCosts[itemId] === undefined) {
                        breakdownCosts[itemId] = 0;
                    }
                    // add it to the breakdown
                    breakdownCosts[itemId] += neededCount;
                }
                // otherwise we need to break it down
                else {
                    const costs = item.recipe.costs;
                    for (const { id: recipeItemId, count: recipeCount } of costs) {
                        breakdownItem((recipeCount * neededCount), recipeItemId);
                    }
                }
            }
        };

        for (const key in totalCostDict) {
            if (battleRecords.value.find(b => b.id === key)) {
                continue;
            }
            breakdownItem(totalCostDict[key], key);
        }

        const costs: { item: Item, count: number }[] = [];

        for (const [key, value] of Object.entries(breakdownCosts)) {
            costs.push({ item: items.value[key], count: value });
        }

        costs.push(...neededEXPItems.value);

        return costs.sort((a, b) => a.item.sortId - b.item.sortId);
    });

    const recomendedStages = computed(() =>
        Object.entries(missingItems.value.itemsToFarm)
            .map(([itemId, count]) => (
                {
                    item: items.value[itemId],
                    count,
                    stage: stages[itemId]
                }))
            .sort((a, b) => a.item.sortId - b.item.sortId)
    );

    // Drive API
    const getDriveClient = async () => {
        if (!driveClient) {
            driveClient = new DriveClient(clientId, scope);
        }

        await driveClient.initializationPromise;
        return driveClient;
    }

    const renderButton = async (button: HTMLElement) => {
        const client = await getDriveClient();
        client.renderButton(button);
    }

    const updateFile = async () => {
        const client = await getDriveClient();
        const data = exportSavedRecords();
        await client.updateFile(data);
    }

    const downloadFile = async () => {
        const client = await getDriveClient();
        const data = await client.downloadFile();
        importSavedRecords(JSON.stringify(data));
    }

    // Crafting
    const reservedItems = ref(getBlankInventory());

    const availableItems = computed(() => {
        const aItems: { [key: string]: number } = getInventoryCopy();

        for (const [itemId, count] of Object.entries(reservedItems.value)) {
            aItems[itemId] -= count;
        }

        for (const key in aItems) {
            if (key !== lmdId.value && (aItems[key] <= 0 || isNaN(aItems[key]))) {
                delete aItems[key];
            }
        }

        return aItems;
    });

    const commitDictionaryTransaction = (dict: { [key: string]: number; }, transaction: { [key: string]: number; }) => {
        for (const key in dict) {
            delete dict[key];
        }

        for (const key in transaction) {
            dict[key] = transaction[key];
        }
    }

    const handleItem = (
        item: Item,
        available: { [key: string]: number; },
        itemsToFarm: { [key: string]: number; },
        itemsToCraft: { [key: string]: number; },
        hasEfficientParent: boolean = false // skip checking if a parent is efficient to farm
    ): number => {

        const { itemId } = item;
        let output = 0;

        const shouldFarm = !hasEfficientParent && efficientToFarmItemIds.indexOf(itemId) >= 0;

        // if available take it from there
        if (available[itemId] > 0) {
            available[itemId]--;
            output = 1;
        }
        // else if check if we can craft it with or without farming children
        // skip chips as they infinitely recurse
        else if (item.recipe && farmingChips.indexOf(itemId) < 0) {
            // setup a transaction style edit of our states
            const availableUpdate = JSON.parse(JSON.stringify(available));
            const itemsToFarmUpdate = JSON.parse(JSON.stringify(itemsToFarm));
            const itemsToCraftUpdate = JSON.parse(JSON.stringify(itemsToCraft));

            let canResolve = true;

            for (const childNode of item.recipe.costs) {
                let childCount = childNode.count;
                const childItem = items.value[childNode.id];

                if (childItem.itemId === lmdId.value) {
                    const availableLMD = availableUpdate[lmdId.value] ?? 0;
                    const subtractamount = Math.min(childCount, availableLMD);

                    childCount -= subtractamount;
                    availableUpdate[lmdId.value] -= subtractamount;

                    if (childCount > 0) {
                        if (itemsToFarmUpdate[lmdId.value] === undefined) {
                            itemsToFarmUpdate[lmdId.value] = 0;
                        }

                        itemsToFarmUpdate[lmdId.value] += childCount;
                    }

                    continue;
                }

                while (childCount > 0) {
                    const amountProduced = handleItem(
                        childItem,
                        availableUpdate,
                        itemsToFarmUpdate,
                        itemsToCraftUpdate,
                        shouldFarm || hasEfficientParent
                    );

                    if (amountProduced <= 0) {
                        canResolve = false;
                        break;
                    }
                    else {
                        childCount -= amountProduced;
                    }
                }

                if (!canResolve) {
                    break;
                }
            }

            if (canResolve) {
                if (itemsToCraftUpdate[itemId] === undefined) {
                    itemsToCraftUpdate[itemId] = 0;
                }

                itemsToCraftUpdate[itemId] += item.recipe.count;

                commitDictionaryTransaction(available, availableUpdate);
                commitDictionaryTransaction(itemsToFarm, itemsToFarmUpdate);
                commitDictionaryTransaction(itemsToCraft, itemsToCraftUpdate);
                output = item.recipe.count;
            }
        }

        // else check if the item is efficient to farm
        if (
            !hasEfficientParent &&
            output === 0 &&
            shouldFarm
        ) {
            if (itemsToFarm[itemId] === undefined) {
                itemsToFarm[itemId] = 0;
            }
            itemsToFarm[itemId]++;
            output = 1;
        }

        return output;
    }

    const testingNeededItems = ref<{ item: Item; count: number; }[]>([]);

    const missingItems = computed(() => {
        // setup our states, we split our needed items and subcomponents into items to farm and items to craft
        const itemsToFarm: { [key: string]: number; } = {};
        const itemsToCraft: { [key: string]: number; } = {};

        // copy the available items and needed items so we can modify it
        const available: { [key: string]: number; } = JSON.parse(JSON.stringify(availableItems.value));
        const needed: { [key: string]: number; } = {};

        // TODO: fix this when done testing
        const n: { item: Item; count: number; }[] = testingNeededItems.value;//neededItems.value;

        for (const { item, count } of n) {
            if (needed[item.itemId] === undefined) {
                needed[item.itemId] = 0;
            }
            needed[item.itemId] += count;
        }

        // TODO: remove this when done testing
        const returnNeeded: { [key: string]: number; } = JSON.parse(JSON.stringify(needed));

        // for each item we need, see if we can craft and or farm it and do the same for its children
        for (const itemId in needed) {
            const item = items.value[itemId];

            while (needed[itemId] > 0) {
                let created = handleItem(item, available, itemsToFarm, itemsToCraft);
                if (created > 0) {
                    needed[itemId] -= created;
                }
                else {
                    break;
                }
            }
        }

        // handle leftover items that we couldn't resolve by adding them to items to farm
        for (const itemId in needed) {
            if (needed[itemId] > 0) {
                if (itemsToFarm[itemId] === undefined) {
                    itemsToFarm[itemId] = 0;
                }
                itemsToFarm[itemId] += needed[itemId];
            }
        }

        return {
            itemsToFarm,
            itemsToCraft,
            startingItems: returnNeeded,
            leftoverItems: needed
        }
    });

    const loadReservedItems = () => {
        const reservedItemsString = localStorage.getItem('reservedItems');
        // if we have previously saved reserved items, load them
        if (reservedItemsString) {
            reservedItems.value = JSON.parse(reservedItemsString);
        }
        // else set the reserved items to the default values
        else {
            for (const [itemId, item] of Object.entries(items.value)) {
                if (
                    (item.rarity === 'TIER_1' || item.rarity === 'TIER_2') &&
                    efficientToFarmItemIds.indexOf(itemId) < 0
                ) {
                    reservedItems.value[itemId] = 20;
                }
                else {
                    reservedItems.value[itemId] = 0;
                }
            }
        }
    }

    // Watchers
    const writeOperators = debounce((value: SelectedOperator[]) => {
        const onlyUnique = (value: string, index: number, array: string[]) => array.indexOf(value) === index;

        // the filter is because of an odd bug with Vite in dev duplicating entries
        const selectedCharacters = value.map(c => c.operator.id).filter(onlyUnique);

        localStorage.setItem('selectedCharacters', JSON.stringify(selectedCharacters));
        for (const selectedOperator of value) {
            const saveString = `plans-${selectedOperator.operator.id}`;
            localStorage.setItem(saveString, JSON.stringify(new SaveRecord(selectedOperator)));
        }

        if (driveClient && driveClient.credentials) {
            console.log('updating operators in drive');
            updateFile();
        }
    }, 1000);
    watch(selectedOperators, writeOperators, { deep: true });

    const writeInventory = debounce((value: {
        [key: string]: number;
    }) => {
        localStorage.setItem('inventory', JSON.stringify(value));

        if (driveClient && driveClient.credentials) {
            console.log('updating inventory in drive');
            updateFile();
        }
    }, 1000);
    watch(inventory, writeInventory, { deep: true });

    const writeReservedItems = debounce((value: {
        [key: string]: number;
    }) => {
        localStorage.setItem('reservedItems', JSON.stringify(value));

        if (driveClient && driveClient.credentials) {
            console.log('updating reserved items in drive');
            updateFile();
        }
    }, 1000);
    watch(reservedItems, writeReservedItems, { deep: true });

    return {
        items,
        operators,
        lmdId,
        selectedOperators,
        inventory,
        totalCosts,
        totalCostsByOperator,
        totalCostsByOperatorCategorized,
        battleRecords,
        neededItems,
        neededItemsBreakdown,
        recomendedStages,
        loadCharacters,
        loadSavedRecords,
        selectCharacter,
        craftItem,
        exportSavedRecords,
        getBlankInventory,
        importSavedRecords,
        renderButton,
        downloadFile,
        updateFile,
        getDriveClient,
        googleDriveTest,
        bringActiveToTop,
        loadReservedItems,
        reservedItems,
        availableItems,
        missingItems,
        testingNeededItems,
    }
});