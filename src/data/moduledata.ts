import type { UniEquip_Table } from "../types/operator";

const jsonLink = "https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/main/en_US/gamedata/excel/uniequip_table.json";
const cn_jsonLink = "https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/uniequip_table.json";

const getModuledata = async () => {
    const [response, cn_response] = await Promise.all([fetch(jsonLink), fetch(cn_jsonLink)]);
    const [data, cn_data]: UniEquip_Table[] = await Promise.all([response.json(), cn_response.json()]);

    const combinedData = Object.assign(cn_data, data);

    return { ModuleDict: combinedData.equipDict, CharacterModules: combinedData.charEquip };
};

export default getModuledata;