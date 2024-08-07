import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { SelectedOperator, OldSaveRecord, LevelUpNeeds, LevelUpNeedsKey, SaveRecord, IsOldSaveRecord } from '../types/planner-types';
import { debounce } from 'lodash';
import { levelingCostsArray } from '../data/leveling-costs';
import promotionLMDCosts from '../data/promotionCosts';
import { efficientToFarmItemIds, stages } from '../data/farmingdata';
import getArknightsData from '../data/arknightsdata';
import type { Item, Operator } from '../types/outputdata';
import { OperatorPlans } from '../types/plans';
import DriveClient from '../api/google-drive-api';
import { clientId, scope } from '../data/authInfo';
import { localeCompare } from '../data/operatorNameCompare';
//import { clientId, scope } from '../data/devauthinfo';

export const usePlannerStore = defineStore('planner', () => {
    const operators = ref<Operator[]>([]);
    const selectedOperators = ref<SelectedOperator[]>([]);
    const items = ref<{ [key: string]: Item }>({});
    const lmdId = ref<string>('4001'); // this should be constant
    const reserveTier1 = ref<number>(0);
    const reserveTier2 = ref<number>(0);
    const reserveTier3 = ref<number>(0);
    const reserveTier4 = ref<number>(0);
    const reserveTier5 = ref<number>(0);
    const reserveTier6 = ref<number>(0);

    let driveClient: DriveClient;

    const googleDriveTest = ref<boolean>(false);
    googleDriveTest.value = localStorage.getItem("GoogleDriveTest") === "1";

    const getEXPValue = (inventory: { [key: string]: number; }) => {
        let exp = 0;
        for (const itemId in inventory) {
            const gainExp = items.value[itemId]?.gainExp ?? 0;
            const qty = isNaN(inventory[itemId]) ? 0 : inventory[itemId];
            exp += qty * gainExp;
        }
        return exp;
    }

    // Operators
    async function loadCharacters() {
        const data = await getArknightsData();

        const opsval: {
            [key: string]: Operator;
        } = data.operators as {
            [key: string]: Operator;
        };

        for (const operatorId in opsval) {
            const opVal = opsval[operatorId];
            opVal.id = operatorId;

            operators.value.push(opVal);
        }

        items.value = data.items;

        const currentInventory = JSON.parse(JSON.stringify(inventory.value)); // don't modify the original inventory
        inventory.value = { ...getBlankInventory(), ...currentInventory };
    }

    function exportSavedRecords() {
        const selectedCharacters = selectedOperators.value.map(c => c.operator.id);
        const currentInventory = Object.fromEntries(Object.entries(inventory.value).filter(b => b[1] > 0));
        const operatorPlans: SaveRecord[] = [];

        for (const { operator, plans, active, sort } of selectedOperators.value) {
            const saveRecord: SaveRecord = {
                operatorId: operator.id,
                plans,
                active,
                sort
            };
            operatorPlans.push(saveRecord);
        }

        const exportData = {
            s: selectedCharacters,
            i: currentInventory,
            p: operatorPlans
        };

        //console.log(exportData);
        return exportData;
    }

    function importSavedRecords(importString: string) {
        let dataold: {
            p: OldSaveRecord[] | SaveRecord[];
            s: string[];
            i: { [key: string]: number };
        };

        let data: {
            p: SaveRecord[];
            s: string[];
            i: { [key: string]: number };
        } | null = null;

        try {
            dataold = JSON.parse(importString);
            data = {
                p: [],
                s: dataold.s,
                i: dataold.i
            };

            data.p = dataold.p.map((record): SaveRecord => {
                if (IsOldSaveRecord(record)) {
                    const oldPlans = record.plans;
                    const newPlans: OperatorPlans = {
                        ...oldPlans,
                        targetModules: [],
                        currentModules: []
                    };

                    if ((oldPlans.currentModules.x ?? 0) > 0) {
                        newPlans.currentModules.push({ type: 'X', level: oldPlans.currentModules.x });
                    }
                    if ((oldPlans.currentModules.y ?? 0) > 0) {
                        newPlans.currentModules.push({ type: 'Y', level: oldPlans.currentModules.y });
                    }
                    if ((oldPlans.currentModules.d ?? 0) > 0) {
                        newPlans.currentModules.push({ type: 'D', level: oldPlans.currentModules.d });
                    }

                    if ((oldPlans.targetModules.x ?? 0) > 0) {
                        newPlans.targetModules.push({ type: 'X', level: oldPlans.targetModules.x });
                    }
                    if ((oldPlans.targetModules.y ?? 0) > 0) {
                        newPlans.targetModules.push({ type: 'Y', level: oldPlans.targetModules.y });
                    }
                    if ((oldPlans.targetModules.d ?? 0) > 0) {
                        newPlans.targetModules.push({ type: 'D', level: oldPlans.targetModules.d });
                    }

                    return {
                        ...record,
                        plans: newPlans,
                        sort: 9999999999999
                    };
                }
                else {
                    return record;
                }
            });
        }
        catch (e) {
            alert('Invalid data format');
            return;
        }

        if (data == null || !Array.isArray(data.p) || !Array.isArray(data.s) || data.i == null) {
            alert('Invalid data format');
            return;
        }

        localStorage.setItem('selectedCharacters', JSON.stringify(data.s));
        localStorage.setItem('inventory', JSON.stringify(data.i));

        const saveRecords = data.p;
        for (const op of saveRecords) {
            const saveString = `plans-${op.operatorId}`;
            localStorage.setItem(saveString, JSON.stringify(op));
        }

        selectedOperators.value = [];

        inventory.value = { ...getBlankInventory(), ...data.i };
        loadSavedRecords();
    }

    function loadSavedRecords() {
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
    const inventory = ref<{ [key: string]: number }>(
        {
            ...getBlankInventory(),
            ...(JSON.parse(localStorage.getItem('inventory') || '{}'))
        }
    );

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
        const currentInventory = JSON.parse(JSON.stringify(inventory.value)); // don't modify the original inventory
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
        neededItemsBreakdown.value
            .filter(({ item: { itemId } }) => stages[itemId])
            .sort((a, b) =>
                ((efficientToFarmItemIds.indexOf(a.item.itemId) >= 0) === (efficientToFarmItemIds.indexOf(b.item.itemId) >= 0)) ?
                    b.item.sortId - a.item.sortId :
                    efficientToFarmItemIds.indexOf(b.item.itemId) - efficientToFarmItemIds.indexOf(a.item.itemId))
            .map(({ item }) => ({ stage: stages[item.itemId], item })));
    
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
        reserveTier1,
        reserveTier2,
        reserveTier3,
        reserveTier4,
        reserveTier5,
        reserveTier6,
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
    }
});