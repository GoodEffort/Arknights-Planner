import { canCraft, getBattleRecords, getCostOfOperator, getReservedItems, getTotalCosts, getTotalCostsByOperator } from '@/store/store-inventory-functions';
import { getBlankInventoryFromItems, getArknightsData, getExportData, setImportData, getSavedOperatorRecords, getSavedOperatorData } from '@/store/store-operator-functions';
import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { debounce } from 'lodash';
import DriveClient from '@/api/google-drive-api';
import { getEfficentToFarmItemIds } from '@/store/store-item-functions.';
import { SelectedOperator, SaveRecord } from '@/types/planner-types';

import type { LevelUpNeeds, Inventory, EventGains } from '@/types/planner-types';
import type { Item, Operator } from '@/types/outputdata';

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
    const reservedItems = ref(getBlankInventory());
    const futureEventGains = ref<EventGains>({});

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
        let ret: SelectedOperator | undefined;

        const existingSelection = selectedOperators.value.find(c => c.operator === character);
        if (existingSelection === undefined) {
            const newOperatorSelection = getSavedOperatorData(character);
            selectedOperators.value.push(newOperatorSelection);
            ret = newOperatorSelection;
        }
        else if (confirm(`Are you sure you want to remove ${character.name} from your selection?`)) {
            selectedOperators.value.splice(selectedOperators.value.indexOf(existingSelection), 1);
        }

        localStorage.setItem('selectedCharacters', JSON.stringify(selectedOperators.value.map(c => c.operator.id)));
        return ret;
    }

    function craftItem(item: Item) {
        if (canCraft(item, inventory.value, items.value)) {
            // remove items from inventory
            for (const { id, count } of item.recipe.costs) {
                inventory.value[id] -= count;
            }

            // add crafted item to inventory
            inventory.value[item.itemId] += item.recipe.count;
        }
    }

    function loadReservedItems() {
        reservedItems.value = getReservedItems(items.value, getEfficentToFarmItemIds(items.value));
    }

    // Computed
    const battleRecords = computed(() => getBattleRecords(items.value));

    const totalCostsByOperatorCategorized = computed(() => {
        const neededItemsByOperator: { [key: string]: LevelUpNeeds } = {};

        for (const selectedOperator of selectedOperators.value) {
            neededItemsByOperator[selectedOperator.operator.id] = getCostOfOperator(selectedOperator, lmdId.value, battleRecords.value);
        }

        return neededItemsByOperator;
    });

    const totalCosts = computed(() => getTotalCosts(
        getBlankInventory(),
        getTotalCostsByOperator(
            totalCostsByOperatorCategorized.value,
            getBlankInventory
        ),
        selectedOperators.value
    ));

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
        totalCostsByOperatorCategorized,
        battleRecords,
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
        futureEventGains,
    }
});
