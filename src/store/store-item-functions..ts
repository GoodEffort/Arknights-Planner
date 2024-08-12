import { efficientToFarmItemIds, farmingChips } from "../data/farmingdata";
import { Item, Recipe } from "../types/outputdata";
import { Inventory, ItemWithRecipe } from "./store-inventory-functions";

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

    return needed.sort((a, b) => a.item.sortId - b.item.sortId);
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
    // setup a transaction style edit of our states
    const availableUpdate: Inventory = duplicateInventory(available);
    const itemsToFarmUpdate: Inventory = duplicateInventory(itemsToFarm);
    const itemsToCraftUpdate: Inventory = duplicateInventory(itemsToCraft);

    // if this is true at the end of the loop we can resolve the recipe
    // either by using available resources to craft it or by farming the resources
    let canResolve = true;

    // calculate the amount of crafts we need to do to fulfill the needed output (most of the time the recipe output is 1, but there are some exceptions)
    // if the output is more than the needed qty we can't do a partial craft
    const amountOfCrafts = Math.ceil(qty / recipeOutput);

    for (const childNode of costs) {
        // calculate the amount of children we need for the amount of crafts we need to do
        let childNeededQty = childNode.count * amountOfCrafts;

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
            canResolve = false;
            break;
        }
    }

    // if we can resolve the recipe we commit the transaction and add the crafting output to the total output
    if (canResolve) {
        if (itemsToCraftUpdate[itemId] === undefined) {
            itemsToCraftUpdate[itemId] = 0;
        }

        const craftOutput = recipeOutput * amountOfCrafts;

        itemsToCraftUpdate[itemId] += craftOutput;

        commitDictionaryTransaction(available, availableUpdate);
        commitDictionaryTransaction(itemsToFarm, itemsToFarmUpdate);
        commitDictionaryTransaction(itemsToCraft, itemsToCraftUpdate);

        return craftOutput;
    }

    return 0;
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

    const shouldFarm = !hasEfficientParent && efficientToFarmItemIds.indexOf(itemId) >= 0;

    // if we have some available take what we can from there and add it to the output and remove it from the available resources
    output += removeFromAvailable(available, itemId, qty);

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

const getAvailableItems = (inventory: Inventory, _: Inventory, lmdId: string) => {
    // for (const [itemId, count] of Object.entries(reservedItems)) {
    //     //inventory[itemId] -= count;
    // }

    for (const key in inventory) {
        if (key !== lmdId && (inventory[key] <= 0 || isNaN(inventory[key]))) {
            delete inventory[key];
        }
    }

    return inventory;
}

export {
    getNeededEXPItems,
    getNeededItems,
    handleItem,
    getAvailableItems,
}