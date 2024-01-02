export type WorkshopCost = {
    id: string;
    count: number;
    type: string;
};

type Building_Table = {
    workshopFormulas: {
        [key: string]: {
            costs: WorkshopCost[];
        } & { [key: string]: any };
    }
};

const jsonLink = "https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/main/en_US/gamedata/excel/building_data.json";

const getBuildingdata = async () => {
    const response = await fetch(jsonLink);
    const data: Building_Table & { [key: string]: any } = await response.json();
    
    const { workshopFormulas } = data;

    const WorkshopCosts: { [key: string]: WorkshopCost[] } = {};
    for (const key in workshopFormulas) {
        WorkshopCosts[key] = workshopFormulas[key].costs;
    }

    return WorkshopCosts;
};

export default getBuildingdata;