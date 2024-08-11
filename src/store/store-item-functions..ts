import { Item } from "../types/outputdata";

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

export {
    getNeededEXPItems
}