type Building_Table = {
    workshopFormulas: {
        [key: string]: {
            costs: {
                id: string;
                count: number;
                type: string;
            }[];
        } & { [key: string]: any };
    }
};

const jsonLink = "https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/main/en_US/gamedata/excel/building_data.json";
const cn_jsonLink = "https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/building_data.json";

const getBuildingdata = async () => {
    const [response, cn_response] = await Promise.all([
        fetch(jsonLink),
        fetch(cn_jsonLink)
    ]);

    const [data, cn_data]: Building_Table[] = await Promise.all([response.json(), cn_response.json()]);

    const combinedData = Object.assign(data, cn_data);

    const { workshopFormulas } = combinedData;

    const WorkshopCosts: {
        [key: string]: {
            id: string;
            count: number;
            type: string;
        }[]
    } = {};
    for (const key in workshopFormulas) {
        WorkshopCosts[key] = workshopFormulas[key].costs;
    }

    return WorkshopCosts;
};

export default getBuildingdata;