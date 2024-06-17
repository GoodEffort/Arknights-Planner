type Building_Table = {
    workshopFormulas: {
        [key: string]: {
            itemId: string;
            goldCost: number;
            costs: {
                id: string;
                count: number;
                type: string;
            }[];
        };
    };
    manufactFormulas: {
        [key: string]: {
            itemId: string;
            costs: {
                id: string;
                count: number;
                type: string;
            }[];
        };
    };
};

const jsonLink = "https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/main/en_US/gamedata/excel/building_data.json";
const cn_jsonLink = "https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/building_data.json";

const getBuildingdata = async () => {
    const [response, cn_response] = await Promise.all([
        fetch(jsonLink),
        fetch(cn_jsonLink)
    ]);

    const [data, cn_data]: Building_Table[] = await Promise.all([response.json(), cn_response.json()]);

    const combinedData = Object.assign(cn_data, data);

    const { workshopFormulas, manufactFormulas } = combinedData;

    const Recipes: {
        [key: string]: {
            id: string;
            count: number;
            type: string;
        }[]
    } = {};

    for (const key in workshopFormulas) {
        const { itemId, costs, goldCost } = workshopFormulas[key];
        Recipes[itemId] = costs;
        Recipes[itemId].push({ id: "4001", count: goldCost, type: "gold" });
    }

    for (const key in manufactFormulas) {
        const { itemId, costs } = manufactFormulas[key];
        Recipes[itemId] = costs;
    }

    return Recipes;
};

export default getBuildingdata;