<script setup lang="ts">
import { ref } from 'vue';
import { usePlannerStore } from '@/store/planner-store';
import { storeToRefs } from 'pinia';
import type { ARKPRTSData } from '@/types/arkprts';
import type { SaveRecord } from '@/types/planner-types';
import { Operator } from '@/types/outputdata';
import { combineCurrentRecordsWithImport } from '@/data/arkprts-to-record';
import { Inventory } from '@/store/store-inventory-functions';
import { setImportData } from '@/store/store-operator-functions';

type Tmpl = NonNullable<ARKPRTSData["troop"]["chars"]["0"]["tmpl"]>;

const importString = ref('');
const activateAdded = ref(false);

const { lmdId, operators } = storeToRefs(usePlannerStore());
const { exportSavedRecords, getBlankInventory, loadSavedRecords } = usePlannerStore();

const importData = () => {
    const data: ARKPRTSData = JSON.parse(importString.value);

    const chars = Object.values(data.troop.chars);

    // fix Amiya forms
    const patchChars = chars.filter(char => char.tmpl !== undefined);
    if (patchChars.length > 0) {
        for (const char of patchChars) {
            for (const patchedCharId in (char.tmpl as Tmpl)) {
                const patch = (char.tmpl as Tmpl)[patchedCharId];
                if (patchedCharId === char.charId) {
                    char.skills = patch.skills;
                    char.equip = patch.equip;
                }
                else {
                    const patchedChar = JSON.parse(JSON.stringify(char));
                    patchedChar.charId = patchedCharId;
                    patchedChar.skills = patch.skills;
                    patchedChar.equip = patch.equip;
                    chars.push(patchedChar);
                }
            }
        }
    }

    const inventory = data.inventory;
    inventory[lmdId.value] = data.status.gold;

    const records: SaveRecord[] = [];

    const { p: currentPlans, s: currentSelection } = exportSavedRecords();

    for (const char of chars) {
        const operator: Operator | undefined = operators.value.find(op => op.id === char.charId);
        if (!operator) {
            continue;
        }

        const { modules } = operator;

        const record: SaveRecord = {
            active: false,
            operatorId: char.charId,
            plans: {
                currentElite: char.evolvePhase,
                targetElite: char.evolvePhase,
                currentLevel: char.level,
                targetLevel: char.level,
                currentModules: modules.map(mod => ({
                    type: mod.type,
                    level: char.equip[mod.id]?.level ?? 0
                })),
                targetModules: modules.map(mod => ({
                    type: mod.type,
                    level: char.equip[mod.id]?.level ?? 0
                })),
                currentSkillLevels: char.mainSkillLvl,
                targetSkillLevels: char.mainSkillLvl,
                currentSkillMasteries: {
                    skill1: char.skills[0]?.specializeLevel ?? 0,
                    skill2: char.skills[1]?.specializeLevel ?? 0,
                    skill3: char.skills[2]?.specializeLevel ?? 0
                },
                targetSkillMasteries: {
                    skill1: char.skills[0]?.specializeLevel ?? 0,
                    skill2: char.skills[1]?.specializeLevel ?? 0,
                    skill3: char.skills[2]?.specializeLevel ?? 0
                }
            },
            sort: 9999999999999
        };

        records.push(record);
    }

    if (activateAdded.value) {
        for (const record of records) {
            record.active = true;
        }
    }

    const importedOperators = combineCurrentRecordsWithImport(currentPlans, records);
    const importedInventory: Inventory = { ...getBlankInventory(), ...inventory };

    setImportData(JSON.stringify({
        s: importedOperators.map(op => op.operatorId).filter(id => !currentSelection.includes(id)).concat(currentSelection),
        p: importedOperators,
        i: importedInventory
    }));

    loadSavedRecords();
};

const pasteFromClipboard = async () => {
    const text = await navigator.clipboard.readText();
    importString.value = text;
};
</script>

<template>
    <div>
        <h2>Import Data</h2>
        <div class="mb-2">
            <p>
                <a href="https://arkprts.ashlen.top/" target="_blank" rel="noopener noreferrer">ArkPRTS</a> is a tool
                that allows you to pull data right from your Arknights account. You can use it to export your data and
                import it here to save time by not having to manually type your info in.
                <br />
                <br />
                <p>Click Login and then click "Export full raw data." up top and copy the results into the textbox below.</p>
                <p>By default newly imported operators are not set to active since this import can bring in a lot. If you would like them all to be active then check the box below.</p>
            </p>
        </div>
        <div>
            <input type="checkbox" v-model="activateAdded" /> Activate Newly Added Operators
        </div>
        <div class="my-4">
            <textarea rows="10" cols="50" v-model="importString"></textarea>
        </div>
        <button class="btn btn-primary" @click="pasteFromClipboard">Paste from Clipboard</button>
        <hr />
        <button class="btn btn-success" @click="importData">Import Data</button>
    </div>
</template>

<style scoped></style>