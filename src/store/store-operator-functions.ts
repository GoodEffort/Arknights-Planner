import getArknightsData from "../data/arknightsdata";
import { Item, Operator } from "../types/outputdata";

const getBlankInventoryFromItems = (items: { [key: string]: Item; }) => {
    const blankInv: { [key: string]: number } = {};

    for (const itemId in items) {
        blankInv[itemId] = 0;
    }

    return blankInv;
}

const getCharacterData = async () => {
    const operators: Operator[] = [];

    const { items, operators: opsval } = await getArknightsData();

    for (const operatorId in opsval) {
        const operator = opsval[operatorId] as Operator;
        operator.id = operatorId;

        operators.push(operator);
    }

    return { items, operators };
}

export {
    getBlankInventoryFromItems,
    getCharacterData
}