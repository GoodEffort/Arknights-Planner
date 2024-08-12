import { canCraft, getBattleRecords, getCostOfOperator, getEXPValue, getTotalCosts, getTotalCostsByOperator, Inventory } from './store-inventory-functions';
import { getBlankInventoryFromItems, getArknightsData, getExportData, setImportData, getSavedOperatorRecords, getSavedOperatorData } from './store-operator-functions';
import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { SelectedOperator, LevelUpNeeds, SaveRecord } from '../types/planner-types';
import { debounce } from 'lodash';
import { efficientToFarmItemIds } from '../data/farmingdata';
import type { Item, Operator } from '../types/outputdata';
import DriveClient from '../api/google-drive-api';
import { getAvailableItems, getNeededEXPItems, getNeededItems, handleItem } from './store-item-functions.';

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
    const neededItems = computed(() =>
        getNeededItems(
            inventory.value,
            totalCosts.value,
            battleRecords.value,
            items.value,
            getNeededEXPItems(
                totalEXPValueCost.value,
                inventoryEXPValue.value,
                battleRecords.value,
                items.value
            )
        )
    );

    // Drive API
    const getDriveClient = async () => {
        if (!driveClient) {
            driveClient = new DriveClient();
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
    const availableItems = computed(() => getAvailableItems(getInventoryCopy(), reservedItems.value, lmdId.value));

    const missingItems = computed(() => {
        // setup our states, we split our needed items and subcomponents into items to farm and items to craft
        const itemsToFarm: Inventory = {};
        const itemsToCraft: Inventory = {};

        // copy the available items and needed items so we can modify it
        const available: Inventory = JSON.parse(JSON.stringify(availableItems.value));
        const needed: Inventory = {};

        let missingEXPValue: number = totalEXPValueCost.value - inventoryEXPValue.value;

        // setup needed Inventory
        for (const [itemId, count] of Object.entries(totalCosts.value)) {
            if (battleRecords.value.find(b => b.id === itemId) !== undefined) {
                continue;
            }
            else {
                const item = items.value[itemId];
                if (needed[item.itemId] === undefined) {
                    needed[item.itemId] = 0;
                }
                needed[item.itemId] += count;
            }
        }

        // for each item we need, see if we can craft and or farm it and do the same for its children
        for (const itemId in needed) {
            const item = items.value[itemId];

            while (needed[itemId] > 0) {
                let created = handleItem(item, needed[itemId], available, itemsToFarm, itemsToCraft, items.value, lmdId.value);

                if (created > 0) {
                    needed[itemId] -= created;
                }
                else {
                    break;
                }
            }
        }

        // handle leftover items that we couldn't resolve by adding them to items to farm
        // this is stuff like low tier mats that we can't craft and aren't efficient to farm
        for (const itemId in needed) {
            // skip exp items
            if (battleRecords.value.find(b => b.id === itemId) !== undefined) {
                continue;
            }

            // if our leftover item is a reserved item see if we can use the reserved item
            if (reservedItems.value[itemId] > 0) {
                const reservedCount = reservedItems.value[itemId];
                const inventoryCount = inventory.value[itemId];

                if (inventoryCount > reservedCount) {
                    needed[itemId] -= reservedCount;
                }
                else {
                    needed[itemId] -= inventoryCount;
                }
            }
            if (needed[itemId] > 0) {
                if (itemsToFarm[itemId] === undefined) {
                    itemsToFarm[itemId] = 0;
                }
                itemsToFarm[itemId] += needed[itemId];
            }
        }

        // handle exp value
        for(const { gainExp, id } of battleRecords.value) {
            const count = Math.floor(missingEXPValue / gainExp);
            if (count > 0) {           
                itemsToFarm[id] = count;
            }
            missingEXPValue = missingEXPValue % gainExp;
        }

        if (missingEXPValue > 0) {
            const { id } = battleRecords.value[battleRecords.value.length - 1];
            if (itemsToFarm[id] === undefined) {
                itemsToFarm[id] = 0;
            }
            itemsToFarm[id] += 1;
        }

        return {
            itemsToFarm,
            itemsToCraft,
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
    }
});