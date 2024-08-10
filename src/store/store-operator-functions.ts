import fetchArknightsData from "../data/arknightsdata";
import { Item, Operator } from "../types/outputdata";
import { IsOldSaveRecord, OldSaveRecord, SaveRecord, SelectedOperator } from "../types/planner-types";
import { OperatorPlans } from "../types/plans";
import { Inventory } from "./store-functions";

type OldExportData = {
    s: string[];
    i: {
        [k: string]: number;
    };
    p: SaveRecord[] | OldSaveRecord[];
};

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

const getArknightsData = async () => {
    const operators: Operator[] = [];

    const { items, operators: opsval } = await fetchArknightsData();

    for (const operatorId in opsval) {
        const operator = opsval[operatorId] as Operator;
        operator.id = operatorId;

        operators.push(operator);
    }

    return { items, operators };
}

// returns an object that can be exported to a string
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

// puts the imported data into the local storage so it can be loaded
const setImportData = (importString: string) => {
    let dataold: OldExportData;
    let data: ExportData | null = null;

    try {
        dataold = JSON.parse(importString);
        data = {
            p: [],
            s: dataold.s,
            i: dataold.i
        };

        data.p = dataold.p.map((record): SaveRecord => {
            if (IsOldSaveRecord(record)) {
                const oldPlans = record.plans;
                const newPlans: OperatorPlans = {
                    ...oldPlans,
                    targetModules: [],
                    currentModules: []
                };

                if ((oldPlans.currentModules.x ?? 0) > 0) {
                    newPlans.currentModules.push({ type: 'X', level: oldPlans.currentModules.x });
                }
                if ((oldPlans.currentModules.y ?? 0) > 0) {
                    newPlans.currentModules.push({ type: 'Y', level: oldPlans.currentModules.y });
                }
                if ((oldPlans.currentModules.d ?? 0) > 0) {
                    newPlans.currentModules.push({ type: 'D', level: oldPlans.currentModules.d });
                }

                if ((oldPlans.targetModules.x ?? 0) > 0) {
                    newPlans.targetModules.push({ type: 'X', level: oldPlans.targetModules.x });
                }
                if ((oldPlans.targetModules.y ?? 0) > 0) {
                    newPlans.targetModules.push({ type: 'Y', level: oldPlans.targetModules.y });
                }
                if ((oldPlans.targetModules.d ?? 0) > 0) {
                    newPlans.targetModules.push({ type: 'D', level: oldPlans.targetModules.d });
                }

                return {
                    ...record,
                    plans: newPlans,
                    sort: 9999999999999
                };
            }
            else {
                return record;
            }
        });
    }
    catch (e) {
        alert('Invalid data format');
        return;
    }

    if (data == null || !Array.isArray(data.p) || !Array.isArray(data.s) || data.i == null) {
        alert('Invalid data format');
        return;
    }

    localStorage.setItem('selectedCharacters', JSON.stringify(data.s));
    localStorage.setItem('inventory', JSON.stringify(data.i));

    const saveRecords = data.p;
    for (const op of saveRecords) {
        const saveString = `plans-${op.operatorId}`;
        localStorage.setItem(saveString, JSON.stringify(op));
    }
}

export {
    getBlankInventoryFromItems,
    getArknightsData,
    getExportData,
    setImportData,
}

export type {
    ExportData,
    OldExportData,
}