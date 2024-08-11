import { localeCompare } from "../data/operatorNameCompare";
import { Item, Operator } from "../types/outputdata";
import { SaveRecord, OldSaveRecord, SelectedOperator, IsOldSaveRecord } from "../types/planner-types";

// key is item id, value is quantity
type Inventory = { [key: string]: number; };

const inventoryToList = (
    itemDictionary: Inventory,
    itemDefitions: { [key: string]: Item; }
) => {
    const list = [];
    for (const itemId in itemDictionary) {
        const item = itemDefitions[itemId];
        const count = itemDictionary[itemId];
        if (item) {
            list.push({
                item,
                count,
            });
        }
    }
    return list;
}

const getEXPValue = (
    inventory: Inventory | ReturnType<typeof inventoryToList>,
    items?: { [key: string]: Item; }
) => {
    const getEXPFromInvList =
        (inventory: ReturnType<typeof inventoryToList>) => inventory
            // filter out items that don't give EXP
            .filter(({ item }) => item.gainExp !== undefined && item.gainExp > 0)
            // map to EXP gain for each item * quantity
            .map(({ item, count }) => (item.gainExp ?? 0) * count)
            // sum up all EXP gains
            .reduce((acc, val) => acc + val, 0);

    if (Array.isArray(inventory)) {
        return getEXPFromInvList(inventory);
    }
    else if (items) {
        const invList = inventoryToList(inventory, items);
        return getEXPFromInvList(invList);
    }
    else {
        throw new Error('if inventory is an object, items must be provided');
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
    getEXPValue,
    getSavedOperatorRecords,
    getSavedOperatorData,
    bringActiveToTop,
}

export type {
    Inventory
}