import { Item } from "../types/outputdata";

// key is item id, value is quantity
type Inventory = { [key: string]: number; };

const inventoryToList = (
    itemDictionary: Inventory,
    itemDefitions: { [key: string]: Item; }
) => {
    const list = [];
    for (const itemId in itemDictionary) {
        const item = itemDefitions[itemId];
        const count = itemDictionary[itemId];
        if (item) {
            list.push({
                item,
                count,
            });
        }
    }
    return list;
}

const getEXPValue = (
    inventory: Inventory | ReturnType<typeof inventoryToList>,
    items?: { [key: string]: Item; }
) => {
    const getEXPFromInvList =
        (inventory: ReturnType<typeof inventoryToList>) => inventory
            // filter out items that don't give EXP
            .filter(({ item }) => item.gainExp !== undefined && item.gainExp > 0)
            // map to EXP gain for each item * quantity
            .map(({ item, count }) => (item.gainExp ?? 0) * count)
            // sum up all EXP gains
            .reduce((acc, val) => acc + val, 0);

    if (Array.isArray(inventory)) {
        return getEXPFromInvList(inventory);
    }
    else if (items) {
        const invList = inventoryToList(inventory, items);
        return getEXPFromInvList(invList);
    }
    else {
        throw new Error('if inventory is an object, items must be provided');
    }
}



export {
    getEXPValue
}

export type {
    Inventory
}