import fetchArknightsData from "../data/arknightsdata";
import { localeCompare } from "../data/operatorNameCompare";
import { Item, Operator } from "../types/outputdata";
import { IsOldSaveRecord, OldSaveRecord, SaveRecord, SelectedOperator } from "../types/planner-types";
import { OperatorPlans } from "../types/plans";
import { Inventory } from "./store-item-functions";

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

const mapOldRecordToNew = (record: SaveRecord | OldSaveRecord): SaveRecord => {
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
}

const mapOldExportDataToNew = (data: ExportData | OldExportData): ExportData => {
    data.p = data.p.map(mapOldRecordToNew);
    return data as ExportData;
}

// puts the imported data into the local storage so it can be loaded
const setImportData = (importString: string) => {
    let data: ExportData | null = null;

    try {
        const importData: ExportData | OldExportData = JSON.parse(importString);
        data = mapOldExportDataToNew(importData);
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

function getSavedOperatorData(operator: Operator): SelectedOperator {
    const saveString = `plans-${operator.id}`;
    const saveData: string | null = localStorage.getItem(saveString);

    let selectedOperator: SelectedOperator;

    if (saveData) {
        const SaveRecord: OldSaveRecord | SaveRecord = JSON.parse(saveData);
        let sort = 9999999999999;
        if (!IsOldSaveRecord(SaveRecord))
            sort = SaveRecord.sort;
        selectedOperator = new SelectedOperator(operator, SaveRecord.plans, SaveRecord.active, sort);
    }
    else {
        selectedOperator = new SelectedOperator(operator);
        localStorage.setItem(saveString, JSON.stringify(new SaveRecord(selectedOperator)));
    }

    return selectedOperator
}

const bringActiveToTop = (selectedOperators: SelectedOperator[]) => {
    const bringInactiveToTopSort = (a: SelectedOperator, b: SelectedOperator) => {
        if (a.active === b.active) {
            return localeCompare(a.operator.name, b.operator.name);
        }
        return a.active ? -1 : 1;
    };

    selectedOperators.sort(bringInactiveToTopSort);

    for (const op of selectedOperators) {
        op.sort = selectedOperators.indexOf(op);
    }

    return selectedOperators;
}

const getSavedOperatorRecords = (operators: Operator[]) => {
    const operatorIds: string[] = JSON.parse(localStorage.getItem('selectedCharacters') || '[]');
    const selectedOperators: SelectedOperator[] = [];

    for (const operatorId of operatorIds) {
        const operator = operators.find(c => c.id === operatorId);

        if (operator === undefined) {
            throw new Error(`Operator with id ${operatorId} not found.`);
        }

        const saveRecord = getSavedOperatorData(operator) || new SelectedOperator(operator);
        //console.log(saveRecord);
        if (selectedOperators.find(c => c.operator.id === operatorId) === undefined)
            selectedOperators.push(saveRecord); // only add if it doesn't already exist, Vite is duplicating entries in dev mode

    }

    let sortVal = null;
    for (const op of selectedOperators) {
        if (sortVal === null) {
            sortVal = op.sort;
        }
        else if (sortVal !== op.sort) {
            sortVal = null;
            break;
        }
    }

    if (sortVal !== null) {
        bringActiveToTop(selectedOperators);
    }

    return selectedOperators;
}

export {
    getBlankInventoryFromItems,
    getArknightsData,
    getExportData,
    setImportData,
    getSavedOperatorRecords,
    getSavedOperatorData,
    bringActiveToTop,
}

export type {
    ExportData,
    OldExportData,
}