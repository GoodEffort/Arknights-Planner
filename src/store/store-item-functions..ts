import { efficientToFarmItemIds, farmingChips } from "../data/farmingdata";
import { Item } from "../types/outputdata";
import { Inventory } from "./store-inventory-functions";

const getNeededEXPItems = (
    totalEXPCost: number,
    inventoryEXPCost: number,
    battleRecords: { id: string, gainExp: number }[],
    items: { [key: string]: Item }
) => {
    const needed: { item: Item, count: number }[] = [];

    let neededEXP = totalEXPCost - inventoryEXPCost;
    if (neededEXP > 0) {
        for (const { id, gainExp } of battleRecords) {
            const count = Math.floor(neededEXP / gainExp);
            neededEXP = neededEXP % gainExp;
            if (count > 0) {
                needed.push({ item: items[id], count });
            }
        }
    }

    if (neededEXP > 0) {
        const lastExpItemId = battleRecords[battleRecords.length - 1].id;
        if (needed.find(n => n.item.itemId === lastExpItemId)) {
            needed.find(n => n.item.itemId === lastExpItemId)!.count += 1;
        }
        else {
            needed.push({ item: items[lastExpItemId], count: 1 });
        }
    }

    return needed;
}


const getNeededItems = (
    inventory: Inventory,
    totalCosts: Inventory,
    battleRecords: { id: string, gainExp: number }[],
    items: { [key: string]: Item },
    neededEXPItems: { item: Item, count: number }[],
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

    needed.push(...neededEXPItems);

    return needed.sort((a, b) => a.item.sortId - b.item.sortId);
}

const commitDictionaryTransaction = (dict: { [key: string]: number; }, transaction: { [key: string]: number; }) => {
    for (const key in dict) {
        delete dict[key];
    }

    for (const key in transaction) {
        dict[key] = transaction[key];
    }
}

let callCount = 0;

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
    console.log(`Call count: ${++callCount}`);

    const { itemId } = item;
    let output = 0;

    const shouldFarm = !hasEfficientParent && efficientToFarmItemIds.indexOf(itemId) >= 0;

    // if we have some available take what we can from there and add it to the output and remove it from the available resources
    if (available[itemId] > 0) {
        const produced = Math.min(qty, available[itemId]);
        available[itemId] -= produced;
        output = produced;
    }

    // if our output is less than what we need and we have a recipe
    // and the item is not a farming chip
    // try to craft the item with the available resources
    if (
        output < qty && 
        item.recipe && 
        farmingChips.indexOf(itemId) < 0
    ) {
        // setup a transaction style edit of our states
        const availableUpdate: Inventory = JSON.parse(JSON.stringify(available));
        const itemsToFarmUpdate: Inventory = JSON.parse(JSON.stringify(itemsToFarm));
        const itemsToCraftUpdate: Inventory = JSON.parse(JSON.stringify(itemsToCraft));

        // if this is true at the end of the loop we can resolve the recipe
        // either by using available resources to craft it or by farming the resources
        let canResolve = true;

        // calculate the amount of crafts we need to do
        // if the output is more than the needed qty we can't do a partial craft
        const recipeOutput = item.recipe.count;
        const neededOutput = qty - output;

        // this is the amount of crafts we need to do to fulfill the needed output (most of the time the recipe output is 1, but there are some exceptions)
        const amountOfCrafts = Math.ceil(neededOutput / recipeOutput);

        for (const childNode of item.recipe.costs) {
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

            if (!canResolve) {
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
            output += craftOutput;

            commitDictionaryTransaction(available, availableUpdate);
            commitDictionaryTransaction(itemsToFarm, itemsToFarmUpdate);
            commitDictionaryTransaction(itemsToCraft, itemsToCraftUpdate);

        }
    }

    // if we have any left over and there is no efficient parent to farm we need to farm the item
    if (
        !hasEfficientParent &&
        output < qty &&
        shouldFarm
    ) {
        if (itemsToFarm[itemId] === undefined) {
            itemsToFarm[itemId] = 0;
        }
        itemsToFarm[itemId] += (qty - output);
        output += itemsToFarm[itemId];
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