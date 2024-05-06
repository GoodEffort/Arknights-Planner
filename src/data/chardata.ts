import { Operator, Character_Table } from "../types/operator"

const jsonLink = "https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/main/en_US/gamedata/excel/character_table.json";
const cn_jsonLink = "https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/character_table.json";

const getChardata = async () => {
    const [response, cn_response] = await Promise.all([
        fetch(jsonLink),
        fetch(cn_jsonLink)
    ]);

    const [data, cn_data]: Character_Table[] = await Promise.all([response.json(), cn_response.json()]);

    // get English name from the appellation field
    for (const key in cn_data) {
        let character = cn_data[key];
        character.name = character.appellation;
    }

    const combinedData = Object.assign(data, cn_data);

    // this should combine the new Chinese data with the existing English data allowing to see characters only available in China   
    const chardata: Operator[] = Object.entries({ ...combinedData })
        .map(([id, char]) => {
            return {
                id,
                ...char,
                name: char.name[0] == "'" ? char.name.slice(1, char.name.length - 1) : char.name,
            }
        })
        .filter(char => !char.isNotObtainable && char.id.match(/char_[0-9]+_[a-zA-Z0-9]+/));

    return chardata;
};

export default getChardata;
