<script setup lang="ts">
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { Item } from '../types/item';
import ItemsDisplay from './ItemsDisplay.vue';
import { efficientToFarmItemIds, chipIds } from '../data/farmingdata';

const {
    items,
    expItems,
    lmdId,
    inventory,
    neededItems,
    workShopFormulas,
    reserveTier1,
    reserveTier2,
    reserveTier3,
    reserveTier4,
    reserveTier5,
    reserveTier6
} = storeToRefs(usePlannerStore());

const ignoreItems = computed(() => {
    const ignoreItems: string[] = [];
    ignoreItems.push(lmdId.value);
    ignoreItems.push(...chipIds);
    ignoreItems.push(...Object.keys(expItems.value));
    return ignoreItems;
});

const neededItemDictionary = computed(() => {
    const neededItemDictionary: { [key: string]: number } = {};
    for (const { item, count } of neededItems.value) {
        neededItemDictionary[item.itemId] = count;
    }
    return neededItemDictionary;
});

const getSubItems = (item: Item, count: number = 1): { item: Item, count: number }[] => {
    const subItems: { item: Item, count: number }[] = [];
    
    if (ignoreItems.value.includes(item.itemId) || item.buildingProductList.length === 0) {
        return subItems;
    }

    const { roomType, formulaId } = item.buildingProductList[0];

    if (roomType === 'WORKSHOP') {
        const formula = workShopFormulas.value[formulaId];

        for (const { id: itemId, count: subCount } of formula) {
            const subItem = items.value[itemId];
            subItems.push({ item: subItem, count: subCount * count });
        }
    }

    return subItems;
};

const findNeededCraftingItemsRecursively = (
    farmingList: { [key: string]: number }, 
    availableItems: { [key: string]: number }, 
    itemId: string,
    count: number,
    parentIsEfficientToFarm: boolean = false
): boolean => {
    const isEffiecientToFarm = efficientToFarmItemIds.includes(itemId);

    // if we have enough of the item remove the needed amount from the available amount and return true
    if (availableItems[itemId] >= count) {
        availableItems[itemId] -= count;
        return true;
    }
    // if we don't have enough of the item, remove all of the available amount and subtract the available amount from the needed amount
    else if (availableItems[itemId] > 0) {
        count -= availableItems[itemId];
        availableItems[itemId] = 0;
    }

    // if the item is in the ignore list, add the count to the farming list and return true
    if (ignoreItems.value.includes(itemId)) {
        farmingList[itemId] = count;
        return true;
    }

    // See if we can craft the with the available items
    const item = items.value[itemId];
    const subItems = getSubItems(item, count);

    // if there is no recipe for the item, add the count to the farming list and return true
    if (subItems.length === 0) {
        farmingList[itemId] = count;
        return !parentIsEfficientToFarm;
    }

    // create a transaction object that we can modify and then apply to the farming list and available items if the transaction is successful
    const transaction: {
        farmingList: { [key: string]: number },
        availableItems: { [key: string]: number },
    } = {
        availableItems: JSON.parse(JSON.stringify(availableItems)),
        farmingList: {}
    };

    let success = true;

    // for each sub item, run the function recursively and if it fails, break out of the loop
    for (const { item: subItem, count: subCount } of subItems) {
        const status = findNeededCraftingItemsRecursively(
            transaction.farmingList,
            transaction.availableItems,
            subItem.itemId,
            subCount,
            isEffiecientToFarm
        );

        if (!status) {
            success = false;
            break;
        }
    }

    // if the transaction was successful, apply the transaction to the farming list and available items
    if (success) {
        for (const [key, value] of Object.entries(transaction.farmingList)) {
            if (farmingList[key]) {
                farmingList[key] += value;
            }
            else {
                farmingList[key] = value;
            }
        }

        for (const [key, value] of Object.entries(transaction.availableItems)) {
            availableItems[key] = value;
        }
    }
    // if the transaction was not successful, add the base item to the farming list
    else {
        farmingList[itemId] = count;
    }

    // if the item is efficient to farm or the transaction was successful, return true
    return isEffiecientToFarm || success;
};

const recommendedFarmingItems = computed(() => {
    const farmingList: { [key: string]: number } = {};

    // create a copy of the needed items dictionary that we can modify
    const neededItems: {
        [key: string]: number;
    } = JSON.parse(JSON.stringify(neededItemDictionary.value));

    // Find available items by subtracting needed items from inventory and removing the reserved items for the item's tier
    const availableItems: { [key: string]: number } = {};

    for (const [key, count] of Object.entries(inventory.value)) {
        if (count > 0) {
            const item = items.value[key];

            // set the initial available count for the item
            availableItems[key] = count;

            // get current needed count for item
            const neededItemCount = neededItems[key] || 0;

            // if we need this item, subtract the initially available amount from the needed amount and then subtract the needed from the initially available count
            if (neededItemCount > 0) {
                neededItems[key] -= availableItems[key];
                availableItems[key] -= neededItemCount;
            }

            // get the reserved amount for the item's tier
            let reserved = 0;

            switch (item.rarity) {
                case 'TIER_1':
                    reserved = reserveTier1.value;
                    break;
                case 'TIER_2':
                    reserved = reserveTier2.value;
                    break;
                case 'TIER_3':
                    reserved = reserveTier3.value;
                    break;
                case 'TIER_4':
                    reserved = reserveTier4.value;
                    break;
                case 'TIER_5':
                    reserved = reserveTier5.value;
                    break;
                case 'TIER_6':
                    reserved = reserveTier6.value;
                    break;
            }

            // subtract the reserved amount from the initially available count
            availableItems[key] -= reserved;

            // if the available count is less than 0, set it to 0
            if (availableItems[key] < 0) {
                availableItems[key] = 0;
            }
        }
    }

    // Remove items from needed items that can be crafted and remove the mats from available items
    for (const itemId in neededItems) {
        findNeededCraftingItemsRecursively(farmingList, availableItems, itemId, neededItems[itemId]);
    }

    return farmingList;
});

const itemsToFarm = computed(() => {
    const itemsToFarm: { item: Item, count: number }[] = [];
    for (const [key, count] of Object.entries(recommendedFarmingItems.value)) {
        const item = items.value[key];
        itemsToFarm.push({ item, count });
    }
    return itemsToFarm.sort((a, b) => a.item.sortId - b.item.sortId);
});
</script>

<template>
    <ItemsDisplay :display-items="itemsToFarm" title="Recommended Items to Farm"
        local-storage-id="recommended-farming-collapsed" />
</template>