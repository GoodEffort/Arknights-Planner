const aceshipLink = "https://raw.githubusercontent.com/Aceship/AN-EN-Tags/master/json/gamedata/en_US/gamedata/excel/character_table.json";

const getChardata = async () => {
    const response = await fetch(aceshipLink);
    const data = await response.json();
    const chardata = data;
    return chardata;
}

export { getChardata };
