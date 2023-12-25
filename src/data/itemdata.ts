import type { Item_Table } from "../types/item";

const jsonLink = "https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/main/en_US/gamedata/excel/item_table.json";

const getItemdata = async () => {
    const response = await fetch(jsonLink);
    const data: Item_Table = await response.json();

    return data;
};

export default getItemdata;