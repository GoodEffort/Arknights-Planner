import Character from "../types/character"
type CharacterNoId = Omit<Character, "id">;

const aceshipLink = "https://raw.githubusercontent.com/Aceship/AN-EN-Tags/master/json/gamedata/en_US/gamedata/excel/character_table.json";

type CharData = {
    [key: string]: CharacterNoId;
}

const getChardata = async () => {
    const response = await fetch(aceshipLink);
    const data: CharData = await response.json();

    const chardata: Character[] = Object.entries(data)
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
