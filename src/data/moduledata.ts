import type { UniEquip_Table } from "../types/operator";

const aceshipLink = "https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/main/en_US/gamedata/excel/uniequip_table.json";

const getModuledata = async () => {
    const response = await fetch(aceshipLink);
    const data: UniEquip_Table = await response.json();

    return { ModuleDict: data.equipDict, CharacterModules: data.charEquip };
};

export default getModuledata;