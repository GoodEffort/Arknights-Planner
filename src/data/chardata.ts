import { Operator, Character_Table } from "../types/operator"

const aceshipLink = "https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/main/en_US/gamedata/excel/character_table.json";

const getChardata = async () => {
    const response = await fetch(aceshipLink);
    const data: Character_Table = await response.json();

    const chardata: Operator[] = Object.entries(data)
        .map(([id, char]) => {
            return {
                id,
                ...char,
                name: char.name[0] == "'" ? char.name.slice(1, char.name.length -1) : char.name,
            }
        })
        .filter(char => !char.isNotObtainable && char.id.match(/char_[0-9]+_[a-zA-Z0-9]+/));

    return chardata;
};

export default getChardata;
