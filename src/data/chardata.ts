import { Operator, Character_Table, CharacterPatch } from "../types/operator"

const characterJsonLink = "https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/main/en_US/gamedata/excel/character_table.json";
const cn_characterJsonLink = "https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/character_table.json";

//const characterPatchJsonLink = "https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/main/en_US/gamedata/excel/char_patch_table.json";
const cn_characterPatchJsonLink = "https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/char_patch_table.json";

const getChardata = async () => {
    const [
        response,
        cn_response,
        //patch_response,
        cn_patch_response
    ] = await Promise.all([
        fetch(characterJsonLink),
        fetch(cn_characterJsonLink),
        //fetch(characterPatchJsonLink),
        fetch(cn_characterPatchJsonLink)
    ]);

    const [
        charData,
        cn_charData,
        //patchData,
        cn_patchData
    ]: [
        Character_Table,
        Character_Table,
        //CharacterPatch,
        CharacterPatch,
    ] = await Promise.all([
        response.json(),
        cn_response.json(),
        //patch_response.json(),
        cn_patch_response.json()
    ]);

    // get English name from the appellation field
    for (const key in cn_charData) {
        let character = cn_charData[key];
        character.name = character.appellation;
    }

    const combinedData = Object.assign(cn_charData, charData);

    // get Amiya's other forms
    // this is a loop in case they ever add more characters with multiple forms, probably not needed
    for (const [key, { tmplIds }] of Object.entries(cn_patchData.infos)) {
        const formIds = tmplIds.filter(id => id !== key);

        for (const patchKey of formIds) {
            let profession = cn_patchData.patchChars[patchKey].profession;
            if (profession === "WARRIOR") {
                profession = "Guard";
            } else if (profession === "MEDIC") {
                profession = "Medic"
            }
            const newChar = { 
                ...JSON.parse(JSON.stringify(combinedData[key])),
                ...cn_patchData.patchChars[patchKey],
                name: `${combinedData[key].name} - ${profession}`,
            };

            combinedData[patchKey] = newChar;
        }
    }

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
