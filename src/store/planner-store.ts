import { canCraft, getBattleRecords, getCostOfOperator, getEXPValue, getTotalCosts, getTotalCostsByOperator, Inventory } from './store-inventory-functions';
import { getBlankInventoryFromItems, getArknightsData, getExportData, setImportData, getSavedOperatorRecords, getSavedOperatorData } from './store-operator-functions';
import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { SelectedOperator, LevelUpNeeds, SaveRecord } from '../types/planner-types';
import { debounce } from 'lodash';
import { efficientToFarmItemIds, farmingChips, stages } from '../data/farmingdata';
import type { Item, Operator } from '../types/outputdata';
import DriveClient from '../api/google-drive-api';
import { clientId, scope } from '../data/authInfo';
import { getNeededEXPItems } from './store-item-functions.';
//import { clientId, scope } from '../data/devauthinfo';

export const usePlannerStore = defineStore('planner', () => {
    // Getters
    const getBlankInventory = () => getBlankInventoryFromItems(items.value);
    const exportSavedRecords = () => getExportData(selectedOperators.value, inventory.value);
    const getInventoryCopy = (): Inventory => JSON.parse(JSON.stringify(inventory.value)); // don't modify the original inventory
    const getSavedInventory = (): Inventory => ({ ...getBlankInventory(), ...JSON.parse(localStorage.getItem('inventory') || '{}') });

    // State
    let driveClient: DriveClient;

    const operators = ref<Operator[]>([]);
    const selectedOperators = ref<SelectedOperator[]>([]);
    const items = ref<{ [key: string]: Item }>({});
    const lmdId = ref<string>('4001'); // this should be constant

    const googleDriveTest = ref<boolean>(localStorage.getItem("GoogleDriveTest") === "1");
    
    const inventory = ref<Inventory>(getSavedInventory());

    // Functions
    async function loadCharacters() {
        const data = await getArknightsData();

        operators.value = data.operators;
        items.value = data.items;

        inventory.value = {
            ...getBlankInventory(),
            ...getInventoryCopy()
        };
    }

    function loadSavedRecords() {
        inventory.value = getSavedInventory();
        selectedOperators.value = getSavedOperatorRecords(operators.value);
    }

    function selectCharacter(character: Operator) {
        const existingSelection = selectedOperators.value.find(c => c.operator === character);
        if (existingSelection === undefined) {
            const newOperatorSelection = getSavedOperatorData(character);
            selectedOperators.value.push(newOperatorSelection);
        }
        else if (confirm(`Are you sure you want to remove ${character.name} from your selection?`)) {
            selectedOperators.value.splice(selectedOperators.value.indexOf(existingSelection), 1);
        }

        localStorage.setItem('selectedCharacters', JSON.stringify(selectedOperators.value.map(c => c.operator.id)));
    }

    // Costs
    const battleRecords = computed(() => getBattleRecords(items.value));

    const totalCostsByOperatorCategorized = computed(() => {
        const neededItemsByOperator: { [key: string]: LevelUpNeeds } = {};

        for (const selectedOperator of selectedOperators.value) {
            neededItemsByOperator[selectedOperator.operator.id] = getCostOfOperator(selectedOperator, lmdId.value, battleRecords.value);
        }

        return neededItemsByOperator;
    });

    const totalCostsByOperator = computed(() => getTotalCostsByOperator(totalCostsByOperatorCategorized.value, getBlankInventory));
    const totalCosts = computed(() => getTotalCosts(getBlankInventory(), totalCostsByOperator.value, selectedOperators.value));
    const totalEXPValueCost = computed(() => getEXPValue(totalCosts.value, items.value));

    // Inventory
    const inventoryEXPValue = computed(() => getEXPValue(inventory.value, items.value));

    const craftItem = (item: Item) => {
        if (canCraft(item, inventory.value, items.value)) {
            // remove items from inventory
            for (const { id, count } of item.recipe.costs) {
                inventory.value[id] -= count;
            }
    
            // add crafted item to inventory
            inventory.value[item.itemId] += item.recipe.count;
        }
    }

    // Needed Items
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

        needed.push(
            ...getNeededEXPItems(
                totalEXPValueCost.value, 
                inventoryEXPValue.value, 
                battleRecords.value, 
                items.value
            )
        );

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
        
        costs.push(
            ...getNeededEXPItems(
                totalEXPValueCost.value, 
                inventoryEXPValue.value, 
                battleRecords.value, 
                items.value
            )
        );

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
        setImportData(JSON.stringify(data));
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
        renderButton,
        downloadFile,
        updateFile,
        getDriveClient,
        googleDriveTest,
        loadReservedItems,
        reservedItems,
        availableItems,
        missingItems,
        testingNeededItems,
    }
});