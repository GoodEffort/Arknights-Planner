import type { Item, Item_Table } from "../types/item";

const jsonLink = "https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/main/en_US/gamedata/excel/item_table.json";

const getItemdata = async () => {
    const response = await fetch(jsonLink);
    const data: Item_Table = await response.json();

    const itemsArray = Object.values(data.items).filter(i =>
        i.itemType === "GOLD" ||
        (
            i.itemType === "MATERIAL" ||
            i.itemType === "CARD_EXP"
        ) &&
        i.classifyType === "MATERIAL" &&
        !i.name.match(/.+\sToken/)
    );

    const items: { [key: string]: Item } = {};
    for (const item of itemsArray) {
        items[item.itemId] = item;
    }

    return {
        expItemsObj: data.expItems,
        itemsObj: items
    };
};

export default getItemdata;