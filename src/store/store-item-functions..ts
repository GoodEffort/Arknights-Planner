import { farmingChips, stages } from "@/data/farmingdata";
import { inventoryToList, isEXPItem } from "@/store/store-inventory-functions";
import type { Item, Recipe } from "@/types/outputdata";
import type { EventGains, Inventory, ItemWithRecipe } from "@/types/planner-types";

const getEfficentToFarmItemIds = (items: {
    [key: string]: Item;
}) => Object.keys(stages).filter(id => {
        // manual exceptions
        if (id === '30012') return true; // Orirock Cube
        if (id === '30013') return false; // Orirock Cluster
        if (id === '3301') return true; // Skill Summary - 1
        if (id === '3302') return true; // Skill Summary - 2
        if (id === '3303') return true; // Skill Summary - 3
        if (id === '4001') return true; // LMD

        const item = items[id];

        if (isEXPItem(item)) return true;
        if (farmingChips.includes(id)) return true;

        return item.rarity === 'TIER_3';
        
    })

const getNeededEXPItems = (
    totalEXPValue: number,
    battleRecords: { id: string, gainExp: number }[]
) => {
    const needed: Inventory = {};

    if (totalEXPValue > 0) {
        for (const { id, gainExp } of battleRecords) {
            const count = Math.floor(totalEXPValue / gainExp);
            totalEXPValue = totalEXPValue % gainExp;
            if (count > 0) {
                needed[id] = count;
            }
        }
    }

    if (totalEXPValue > 0) {
        const minEXP = Math.min(...battleRecords.map(b => b.gainExp));
        const minEXPId = battleRecords.find(b => b.gainExp === minEXP)!.id;

        if (needed[minEXPId] === undefined) {
            needed[minEXPId] = 0;
        }

        needed[minEXPId]++;
    }

    return needed;
}


const getNeededItems = (
    inventory: Inventory,
    totalCosts: Inventory,
    battleRecords: { id: string, gainExp: number }[],
    items: { [key: string]: Item },
) => {
    const needed: { item: Item, count: number }[] = [];

    for (const key in totalCosts) {
        if (battleRecords.find(b => b.id === key)) {
            continue;
        }
        const count = totalCosts[key] - (inventory[key] ?? 0);
        if (count > 0) {
            needed.push({
                item: items[key],
                count
            });
        }
    }

    return needed;
}

const duplicateInventory = (inventory: Inventory) => JSON.parse(JSON.stringify(inventory));

const commitDictionaryTransaction = (dict: { [key: string]: number; }, transaction: { [key: string]: number; }) => {
    for (const key in dict) {
        delete dict[key];
    }

    for (const key in transaction) {
        dict[key] = transaction[key];
    }
}

const removeFromAvailable = (available: Inventory, itemId: string, qty: number) => {
    if (available[itemId] === undefined) {
        available[itemId] = 0;
    }

    const produced = Math.min(qty, available[itemId]);
    available[itemId] -= produced;
    return produced;
}

const attemptCraft = (
    itemId: string,
    {
        count: recipeOutput,
        costs
    }: Recipe,
    qty: number,
    available: Inventory,
    itemsToFarm: Inventory,
    itemsToCraft: Inventory,
    items: { [key: string]: Item },
    lmdId: string,
    shouldFarm: boolean,
    hasEfficientParent: boolean,
) => {

    // calculate the amount of crafts we need to do to fulfill the needed output (most of the time the recipe output is 1, but there are some exceptions)
    // if the output is more than the needed qty we can't do a partial craft
    const idealAmountOfCrafts = Math.ceil(qty / recipeOutput);
    let craftable = qty;

    // setup a transaction style edit of our states
    let availableUpdate: Inventory = duplicateInventory(available);
    let itemsToFarmUpdate: Inventory = duplicateInventory(itemsToFarm);
    let itemsToCraftUpdate: Inventory = duplicateInventory(itemsToCraft);

    // find the amount we can craft based on the available resources
    for (const childNode of costs) {    

        // calculate the amount of children we need for the amount of crafts we need to do
        const countPerRecipe = childNode.count;
        const childNeededQty = countPerRecipe * idealAmountOfCrafts;

        // check if we can fulfill the needed qty for the child with the available resources (or farm etc.) recursively
        const amountProduced = handleItem(
            items[childNode.id],
            childNeededQty,
            availableUpdate,
            itemsToFarmUpdate,
            itemsToCraftUpdate,
            items,
            lmdId,
            shouldFarm || hasEfficientParent
        );

        if (amountProduced < childNeededQty) {
            const creatableFromChild = Math.floor(amountProduced / countPerRecipe)
            
            if (creatableFromChild < craftable) {
                craftable = creatableFromChild;
            }
        }
    }

    // if we can't craft any of the items return 0 without committing the transaction
    if (craftable === 0) {
        return 0;
    }

    // setup a transaction style edit of our states
    availableUpdate = duplicateInventory(available);
    itemsToFarmUpdate = duplicateInventory(itemsToFarm);
    itemsToCraftUpdate = duplicateInventory(itemsToCraft);

    // craft what we can with the available resources and change our inventory states
    for (const childNode of costs) {
        // calculate the amount of children we need for the amount of crafts we can do
        const countPerRecipe = childNode.count;
        const childNeededQty = countPerRecipe * craftable;

        const amountProduced = handleItem(
            items[childNode.id],
            childNeededQty,
            availableUpdate,
            itemsToFarmUpdate,
            itemsToCraftUpdate,
            items,
            lmdId,
            shouldFarm || hasEfficientParent
        );

        if (amountProduced < childNeededQty) {
            console.error(`Failed to craft ${itemId} because we couldn't get enough ${childNode.id}. This should be avoided in the previous loop.`);
            return 0;
        }
    }

    // if we can resolve the recipe we commit the transaction and add the crafting output to the total output
    if (itemsToCraftUpdate[itemId] === undefined) {
        itemsToCraftUpdate[itemId] = 0;
    }

    itemsToCraftUpdate[itemId] += craftable;

    commitDictionaryTransaction(available, availableUpdate);
    commitDictionaryTransaction(itemsToFarm, itemsToFarmUpdate);
    commitDictionaryTransaction(itemsToCraft, itemsToCraftUpdate);

    return craftable;
}

const addToFarm = (itemId: string, qty: number, itemsToFarm: Inventory) => {
    if (itemsToFarm[itemId] === undefined) {
        itemsToFarm[itemId] = 0;
    }

    itemsToFarm[itemId] += qty;

    return itemsToFarm[itemId];
}

const isItemWithRecipe = (item: Item): item is ItemWithRecipe => {
    return item.recipe !== undefined;
}

const handleItem = (
    item: Item,
    qty: number,
    available: Inventory,
    itemsToFarm: Inventory,
    itemsToCraft: Inventory,
    items: { [key: string]: Item },
    lmdId: string,
    hasEfficientParent: boolean = false // skip checking if a parent is efficient to farm
): number => {

    const { itemId } = item;
    let output = 0;

    const efficientToFarmItemIds = getEfficentToFarmItemIds(items);

    const shouldFarm = !hasEfficientParent && efficientToFarmItemIds.indexOf(itemId) >= 0;

    // if we have some available take what we can from there and add it to the output and remove it from the available resources
    output += removeFromAvailable(available, itemId, qty);

    // lmd can only be farmed and everything uses it so we can skip the rest of the checks
    if (lmdId === itemId && output < qty) {
        if (itemsToFarm[lmdId] === undefined) {
            itemsToFarm[lmdId] = 0;
        }

        itemsToFarm[lmdId] += qty - output;
        output = qty;
    }

    // if our output is less than what we need and we have a recipe
    // and the item is not a farming chip
    // try to craft the item with the available resources
    if (
        output < qty &&
        isItemWithRecipe(item) &&
        farmingChips.indexOf(itemId) < 0
    ) {
        output += attemptCraft(
            itemId,
            item.recipe,
            (qty - output), //only craft the remaining amount
            available,
            itemsToFarm,
            itemsToCraft,
            items,
            lmdId,
            shouldFarm,
            hasEfficientParent
        );
    }

    // if we have any left over and there is no efficient parent to farm we need to farm the item
    if (!hasEfficientParent && output < qty && shouldFarm) {
        output += addToFarm(itemId, qty - output, itemsToFarm);
    }

    return output;
}

const getMissingItems = (
    totalCosts: Inventory,
    available: Inventory,
    lmdId: string,
    items: { [key: string]: Item },
    reservedItems: Inventory,
    futureEventGains: EventGains,
    excludedEvents: string[],
) => {
    // setup our states, we split our needed items and subcomponents into items to farm and items to craft
    const itemsToFarm: Inventory = {};
    const itemsToCraft: Inventory = {};

    // copy the available items and needed items so we can modify it
    const needed: Inventory = {};

    // setup the total cost list without exp items
    const totalCostList = inventoryToList(totalCosts, items).filter(({ item }) => !isEXPItem(item));

    // setup needed Inventory
    for (const { item, count } of totalCostList) {
        if (needed[item.itemId] === undefined) {
            needed[item.itemId] = 0;
        }

        // if we have available items we can subtract the amount we have from the needed amount
        const subtractAmount = Math.min(count, available[item.itemId] ?? 0)
        needed[item.itemId] += count - subtractAmount;
        available[item.itemId] -= subtractAmount;
    }

    // for each reserved item value we remove it from the available items
    for (const key in reservedItems) {
        if (available[key] === undefined) {
            continue;
        }

        available[key] -= reservedItems[key];

        if (available[key] <= 0) {
            available[key] = 0;
        }
    }

    // add in our future event gains to available items
    for (const eventId in futureEventGains) {
        if (excludedEvents.indexOf(eventId) >= 0) {
            continue;
        }
        
        for (const itemId in futureEventGains[eventId]) {
            if (available[itemId] === undefined) {
                available[itemId] = 0;
            }

            available[itemId] += futureEventGains[eventId][itemId];
        }
    }


    // for each item we need, see if we can craft and or farm it and do the same for its children
    for (const itemId in needed) {
        const item = items[itemId];

        while (needed[itemId] > 0) {
            let created = handleItem(item, needed[itemId], available, itemsToFarm, itemsToCraft, items, lmdId);

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
        if (isEXPItem(items[itemId])) {
            continue;
        }

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
    }
}

export {
    getNeededEXPItems,
    getNeededItems,
    getMissingItems,
    getEfficentToFarmItemIds,
}