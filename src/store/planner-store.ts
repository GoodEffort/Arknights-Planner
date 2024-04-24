import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import type { Operator, CharEquip, EquipDict, Module, Skill } from '../types/operator';
import { SelectedOperator, SaveRecord } from '../types/operator';
import getChardata from '../data/chardata';
import getModuledata from '../data/moduledata';
import getItemdata from '../data/itemdata';
import { ExpItem, Item } from '../types/item';
import { debounce } from 'lodash';
import { levelingCostsArray } from '../data/leveling-costs';
import promotionLMDCosts from '../data/promotionCosts';
import getBuildingdata from '../data/buildingdata';

export const usePlannerStore = defineStore('planner', () => {
    const operators = ref<Operator[]>([]);
    const modules = ref<EquipDict>({});
    const charactersToModules = ref<CharEquip>({});
    const selectedOperators = ref<SelectedOperator[]>([]);
    const expItems = ref<{ [key: string]: ExpItem }>({});
    const items = ref<{ [key: string]: Item }>({});
    const workShopFormulas = ref<{
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
            item.buildingProductList = item.buildingProductList.filter(b => b.roomType === 'WORKSHOP');
        }

        items.value = itemsObj;
        expItems.value = expItemsObj;
    }

    async function loadWorkshopFormulas() {
        const data = await getBuildingdata();
        workShopFormulas.value = data;
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
            selectedOperator = new SelectedOperator(operator, modulesarray, SaveRecord.plans);
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
                    neededItems[id] += count;
                }
            }
        }
    }

    const getModuleCosts = (neededItems: { [key: string]: number }, currentModule: number, targetModule: number, module: Module) => {
        for (
            let currentModuleIndex = currentModule + 1;
            currentModuleIndex <= targetModule;
            currentModuleIndex++
        ) {
            const strIndex: '1' | '2' | '3' = currentModuleIndex.toString() as '1' | '2' | '3';
            const itemCosts = module.itemCost[strIndex];

            for (const { count, id } of itemCosts) {
                neededItems[id] += count;
            }
        }

        return neededItems;
    }

    const getBlankInventory = () => {
        const neededItems: { [key: string]: number } = {};

        for (const itemId in items.value) {
            neededItems[itemId] = 0;
        }

        return neededItems;
    }

    const totalCostsByOperator = computed(() => {
        const neededItemsByOperator: { [key: string]: { [key: string]: number } } = {};

        for (const { modules, plans, operator } of selectedOperators.value) {
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
            } = plans;

            const {
                phases: eliteLevelUpCosts,
                allSkillLvlup: skillLevelUpCosts,
                skills: skillMasteryCosts,
                id: operatorId,
                rarity
            } = operator;

            const neededItems = getBlankInventory();

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
                neededItems[lmdId.value] += lmd;
            }

            // calculate exp items needed
            for (const { gainExp, id } of battleRecords.value) {
                const recordsNeeded = Math.floor(exp / gainExp);
                exp = exp % gainExp;

                if (recordsNeeded > 0) {
                    neededItems[id] += recordsNeeded;
                }
            }

            if (exp > 0) {
                const lastExpItemId = battleRecords.value[battleRecords.value.length - 1].id;
                neededItems[lastExpItemId] += 1;
            }

            // promotion costs
            for (
                let currentEliteIndex = currentElite + 1;
                currentEliteIndex <= targetElite;
                currentEliteIndex++
            ) {
                // promotion costs
                const { evolveCost } = eliteLevelUpCosts[currentEliteIndex];

                if (evolveCost) {
                    for (const { count, id } of evolveCost) {
                        neededItems[id] += count;
                    }

                    if (currentEliteIndex === 1)
                        neededItems[lmdId.value] += promotionLMD.ELITE_1;
                    else if (currentEliteIndex === 2)
                        neededItems[lmdId.value] += promotionLMD.ELITE_2;
                }
            }

            // skill level up costs
            for (
                let currentSkillIndex = currentSkillLevels;
                currentSkillIndex <= targetSkillLevels - 1;
                currentSkillIndex++
            ) {
                const sluc = skillLevelUpCosts[currentSkillIndex];

                if (sluc) {
                    const { lvlUpCost } = sluc;
                    if (lvlUpCost) {
                        for (const { count, id } of lvlUpCost) {
                            neededItems[id] += count;
                        }
                    }
                }
            }

            // mastery costs
            const skill1MasteryCosts = skillMasteryCosts[0];
            const skill2MasteryCosts = skillMasteryCosts[1];
            const skill3MasteryCosts = skillMasteryCosts[2];

            if (skill1MasteryCosts) {
                getMasteryCost(neededItems, targetSkillMasteries.skill1, currentSkillMasteries.skill1, skill1MasteryCosts);
            }
            if (skill2MasteryCosts) {
                getMasteryCost(neededItems, targetSkillMasteries.skill2, currentSkillMasteries.skill2, skill2MasteryCosts);
            }
            if (skill3MasteryCosts) {
                getMasteryCost(neededItems, targetSkillMasteries.skill3, currentSkillMasteries.skill3, skill3MasteryCosts);
            }

            // module costs
            const moduleX = modules.find(m => m.typeName2 === 'X');
            const moduleY = modules.find(m => m.typeName2 === 'Y');
            const moduleZ = modules.find(m => m.typeName2 === 'Z');

            if (moduleX) {
                getModuleCosts(neededItems, currentModules.x, targetModules.x, moduleX);
            }
            if (moduleY) {
                getModuleCosts(neededItems, currentModules.y, targetModules.y, moduleY);
            }
            if (moduleZ) {
                getModuleCosts(neededItems, currentModules.z, targetModules.z, moduleZ);
            }

            neededItemsByOperator[operatorId] = neededItems;
        }

        return neededItemsByOperator;
    });

    const totalCosts = computed(() => {
        const neededItems = getBlankInventory();
        for (const items of Object.values(totalCostsByOperator.value)) {
            for (const [id, count] of Object.entries(items)) {
                neededItems[id] += count;
            }
        }
        return neededItems;
    });

    // Inventory
    const inventory = ref<{ [key: string]: number }>(
        JSON.parse(localStorage.getItem('inventory') || 'null') || {}
    );

    const craftItem = (item: Item) => {
        const { itemId, buildingProductList } = item;

        // verify if we have enough items
        for (const product of buildingProductList) {
            const costs = workShopFormulas.value[product.formulaId];
            for (const { id, count } of costs) {
                if (inventory.value[id] < count) {
                    alert(`You don't have enough ${items.value[id].name} to craft ${item.name}.`);
                    return;
                }
            }
        }

        // remove items from inventory
        for (const product of buildingProductList) {
            const costs = workShopFormulas.value[product.formulaId];
            for (const { id, count } of costs) {
                inventory.value[id] -= count;
            }
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
        let totalExp = 0;

        for (const key in totalCosts.value) {
            if (expItems.value[key] !== undefined) {
                totalExp += expItems.value[key].gainExp * totalCosts.value[key];
            }
            else {
                const count = totalCosts.value[key] - (inventory.value[key] ?? 0);
                if (count > 0) {
                    const item = items.value[key];
                    needed.push({ item, count });
                }
            }
        }

        for (const key in inventory.value) {
            if (expItems.value[key] !== undefined) {
                totalExp -= expItems.value[key].gainExp * inventory.value[key];
            }
        }

        const neededEXPItems: {
            [key: string]: number;
        } = {};

        // calculate exp items needed
        for (const { gainExp, id } of battleRecords.value) {
            const recordsNeeded = Math.floor(totalExp / gainExp);
            totalExp = totalExp % gainExp;

            if (recordsNeeded > 0) {
                if (neededEXPItems[id] === undefined) {
                    neededEXPItems[id] = 0;
                }
                neededEXPItems[id] += recordsNeeded;
            }
        }

        for (const [key, count] of Object.entries(neededEXPItems)) {
            const item = items.value[key];
            needed.push({ item, count });
        }

        return needed.sort((a, b) => a.item.sortId - b.item.sortId);
    });

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
        battleRecords,
        neededItems,
        workShopFormulas,
        reserveTier1,
        reserveTier2,
        reserveTier3,
        reserveTier4,
        reserveTier5,
        reserveTier6,
        loadCharacters,
        loadModules,
        loadItems,
        loadSavedRecords,
        selectCharacter,
        craftItem,
        loadWorkshopFormulas
    }
});