import { ExportData } from '@/store/store-operator-functions';
import { Operator } from '@/types/outputdata';

import type { SaveRecord, Inventory } from '@/types/planner-types'
import type { ArkPrtsCharacter, ArkPrtsCharacterList } from '@/types/arkprts'

const mapArkPrtsToRecord = (arkprts: ArkPrtsCharacterList, operators: Operator[]): SaveRecord[] => {
    const records: SaveRecord[] = [];
    for (const operatorId in arkprts) {
        const arkPrtsChar: ArkPrtsCharacter = arkprts[operatorId];
        const operator: Operator | undefined = operators.find(op => op.id === operatorId);

        if (!operator) {
            console.error(`Operator ${operatorId} not found in operator list`);
            continue;
        }

        const { modules } = operator;

        const record: SaveRecord = {
            active: false,
            operatorId: operatorId,
            plans: {
                currentElite: arkPrtsChar.promotion,
                targetElite: arkPrtsChar.promotion,
                currentLevel: arkPrtsChar.level,
                targetLevel: arkPrtsChar.level,
                currentSkillLevels: arkPrtsChar.skillLevel,
                targetSkillLevels: arkPrtsChar.skillLevel,
                currentModules: [],
                targetModules: [],
                currentSkillMasteries: {
                    skill1: arkPrtsChar.mastery[0] ?? 0,
                    skill2: arkPrtsChar.mastery[1] ?? 0,
                    skill3: arkPrtsChar.mastery[2] ?? 0
                },
                targetSkillMasteries: {
                    skill1: arkPrtsChar.mastery[0] ?? 0,
                    skill2: arkPrtsChar.mastery[1] ?? 0,
                    skill3: arkPrtsChar.mastery[2] ?? 0
                },
            },
            sort: 9999999999999
        };

        for (let i = 0; i < arkPrtsChar.module.length; i++) {
            const moduleLevel = arkPrtsChar.module[i];
            if (moduleLevel) {
                record.plans.currentModules.push({
                    level: moduleLevel,
                    type: modules[i].type
                });
                record.plans.targetModules.push({
                    level: moduleLevel,
                    type: modules[i].type
                });
            }
        }

        records.push(record);
    }
    return records;
}

const combineCurrentRecordsWithImport = (currentRecords: SaveRecord[], importedRecords: SaveRecord[]): SaveRecord[] => {
    const combinedRecords: SaveRecord[] = [];

    for (const imported of importedRecords) {
        const existingRecord = currentRecords.find(record => record.operatorId === imported.operatorId);
        if (!existingRecord) {
            combinedRecords.push(imported);
            continue;
        }
        else {
            const combinedRecord: SaveRecord = {
                active: existingRecord.active,
                operatorId: imported.operatorId,
                plans: { ...imported.plans },
                sort: existingRecord.sort
            };

            const existingPlans = existingRecord.plans;

            if (existingPlans.targetElite > combinedRecord.plans.targetElite) {
                combinedRecord.plans.targetElite = existingPlans.targetElite;
            }
            if (existingPlans.targetLevel > combinedRecord.plans.targetLevel) {
                combinedRecord.plans.targetLevel = existingPlans.targetLevel;
            }
            if (existingPlans.targetSkillLevels > combinedRecord.plans.targetSkillLevels) {
                combinedRecord.plans.targetSkillLevels = existingPlans.targetSkillLevels;
            }
            if (existingPlans.targetSkillMasteries.skill1 > combinedRecord.plans.targetSkillMasteries.skill1) {
                combinedRecord.plans.targetSkillMasteries.skill1 = existingPlans.targetSkillMasteries.skill1;
            }
            if (existingPlans.targetSkillMasteries.skill2 > combinedRecord.plans.targetSkillMasteries.skill2) {
                combinedRecord.plans.targetSkillMasteries.skill2 = existingPlans.targetSkillMasteries.skill2;
            }
            if (existingPlans.targetSkillMasteries.skill3 > combinedRecord.plans.targetSkillMasteries.skill3) {
                combinedRecord.plans.targetSkillMasteries.skill3 = existingPlans.targetSkillMasteries.skill3;
            }

            // if module lists don't match length, just use the current one
            // this is because I'm using CN data and arkPRTS is using Yostar data so these might not match
            if (existingPlans.targetModules.length !== combinedRecord.plans.targetModules.length) {
                combinedRecord.plans.targetModules = existingPlans.targetModules;
                combinedRecord.plans.currentModules = existingPlans.currentModules;
            }
            else {
                for (let i = 0; i < existingPlans.targetModules.length; i++) {
                    const existingModule = existingPlans.targetModules[i];
                    const importedModule = combinedRecord.plans.targetModules[i];
                    if (existingModule.level > importedModule.level) {
                        importedModule.level = existingModule.level;
                    }
                }
            }

            combinedRecords.push(combinedRecord);
        }
    }

    // add any existing records that weren't imported
    for (const existing of currentRecords.filter(record => !combinedRecords.find(imported => imported.operatorId === record.operatorId))) {
        combinedRecords.push(existing);
    }

    return combinedRecords;
}

const verifyCSV = (csv: string) => {
    const lines = csv.split('\n');
    if (lines.length < 2) {
        return false;
    }
    return lines
        .slice(1)
        .every(l =>
            l.split(',').length === 2 &&
            !isNaN(parseInt(l.split(',')[1]))
        );
}

const convertCSVInventory = (csvInventory: string) => {
    if (!verifyCSV(csvInventory)) {
        return {};
    }

    const inventory: Inventory = {};
    const lines = csvInventory.split('\n');
    for (const line of lines) {
        const [itemId, count] = line.split(',');
        inventory[itemId] = parseInt(count);
    }
    return inventory;
}

const importArkPRTSOperatorData = (arkprts: ArkPrtsCharacterList, operators: Operator[], currentRecords: SaveRecord[]): SaveRecord[] => {
    const importedRecords = mapArkPrtsToRecord(arkprts, operators);
    return combineCurrentRecordsWithImport(currentRecords, importedRecords);
}

const importArkPRTSInventoryData = (csvInventory: string, blankInventory: Inventory): Inventory => {
    const importedInventory = convertCSVInventory(csvInventory);
    const newInventory = { ...blankInventory };
    for (const itemId in newInventory) {
        if (importedInventory[itemId]) {
            newInventory[itemId] = importedInventory[itemId];
        }
    }
    return newInventory;
}

const importArkPRTSData = (
    arkprts: ArkPrtsCharacterList,
    operators: Operator[],
    currentRecords: SaveRecord[],
    csvInventory: string,
    blankInventory: Inventory
): ExportData => {
    const records = importArkPRTSOperatorData(arkprts, operators, currentRecords);
    const inventory = importArkPRTSInventoryData(csvInventory, blankInventory);
    return {
        s: records.map(r => r.operatorId),
        i: inventory,
        p: records
    };
}

export default importArkPRTSData;
export { convertCSVInventory, verifyCSV, combineCurrentRecordsWithImport };