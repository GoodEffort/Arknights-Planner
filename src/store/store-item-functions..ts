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

const handleItem = (
    item: Item,
    available: { [key: string]: number; },
    itemsToFarm: { [key: string]: number; },
    itemsToCraft: { [key: string]: number; },
    items: { [key: string]: Item },
    lmdId: string,
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
            const childItem = items[childNode.id];

            if (childItem.itemId === lmdId) {
                const availableLMD = availableUpdate[lmdId] ?? 0;
                const subtractamount = Math.min(childCount, availableLMD);

                childCount -= subtractamount;
                availableUpdate[lmdId] -= subtractamount;

                if (childCount > 0) {
                    if (itemsToFarmUpdate[lmdId] === undefined) {
                        itemsToFarmUpdate[lmdId] = 0;
                    }

                    itemsToFarmUpdate[lmdId] += childCount;
                }

                continue;
            }

            while (childCount > 0) {
                const amountProduced = handleItem(
                    childItem,
                    availableUpdate,
                    itemsToFarmUpdate,
                    itemsToCraftUpdate,
                    items,
                    lmdId,
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

export {
    getNeededEXPItems,
    getNeededItems,
    handleItem,
}