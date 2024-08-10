import getArknightsData from "../data/arknightsdata";
import { Item, Operator } from "../types/outputdata";
import { SaveRecord, SelectedOperator } from "../types/planner-types";
import { Inventory } from "./store-functions";

type ExportData = {
    s: string[];
    i: {
        [k: string]: number;
    };
    p: SaveRecord[];
};

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

const getExportData = (selectedOperators: SelectedOperator[], inventory: Inventory) => {
    const selectedCharacters = selectedOperators
        .map(c => c.operator.id);

    const currentInventory = Object.fromEntries(
        Object.entries(inventory)
            .filter(b => b[1] > 0)
    );
    
    const operatorPlans: SaveRecord[] = [];

    for (const { operator, plans, active, sort } of selectedOperators) {
        const saveRecord: SaveRecord = {
            operatorId: operator.id,
            plans,
            active,
            sort
        };
        operatorPlans.push(saveRecord);
    }

    const exportData: ExportData = {
        s: selectedCharacters,
        i: currentInventory,
        p: operatorPlans
    };

    //console.log(exportData);
    return exportData;
}

export {
    getBlankInventoryFromItems,
    getCharacterData,
    getExportData,
}

export type {
    ExportData
}