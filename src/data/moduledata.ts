import type { UniEquip_Table } from "../types/operator";

const jsonLink = "https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/main/en_US/gamedata/excel/uniequip_table.json";

const getModuledata = async () => {
    const response = await fetch(jsonLink);
    const data: UniEquip_Table = await response.json();

    return { ModuleDict: data.equipDict, CharacterModules: data.charEquip };
};

export default getModuledata;