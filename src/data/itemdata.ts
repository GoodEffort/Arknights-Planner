import type { Item, Item_Table } from "../types/item";

const jsonLink = "https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/main/en_US/gamedata/excel/item_table.json";
const cn_jsonLink = "https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/item_table.json";

const getItemdata = async () => {
    const [response, cn_response] = await Promise.all([
        fetch(jsonLink),
        fetch(cn_jsonLink)
    ]);

    const [data, cn_data]: Item_Table[] = await Promise.all([response.json(), cn_response.json()]);

    const combinedData = Object.assign(data, cn_data);

    const itemsArray = Object.values(combinedData.items).filter(i =>
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
        expItemsObj: combinedData.expItems,
        itemsObj: items
    };
};

export default getItemdata;