import type { JSONData } from '../types/outputdata';

const jsonLink = "https://goodeffort.github.io/Arknights-Planner-Data/arknights-data.json";

const getArknightsData = async () => {
    const response = await fetch(jsonLink);
    const data: JSONData = await response.json();

    return data;
};

export default getArknightsData;