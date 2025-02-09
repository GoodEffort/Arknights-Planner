import type { JSONData } from '@/types/outputdata';

const jsonLink = //import.meta.env.PROD ?
"https://goodeffort.github.io/Arknights-Planner-Data/arknights-data.json"
//: "/Arknights-Planner/arknights-data.json"
;

const fetchArknightsData = async () => {
    const response = await fetch(jsonLink);
    const data: JSONData = await response.json();

    return data;
};

export default fetchArknightsData;