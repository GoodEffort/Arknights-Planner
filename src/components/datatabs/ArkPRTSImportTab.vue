<script setup lang="ts">
import { ref } from 'vue';
import { usePlannerStore } from '@/store/planner-store';
import { storeToRefs } from 'pinia';
import { Module, Operator } from '@/types/outputdata';
import { combineCurrentRecordsWithImport } from '@/data/arkprts-to-record';
import { setImportData } from '@/store/store-operator-functions';
import ImportExportTab from '@/components/datatabs/ImportExportTab.vue';

import type { ARKPRTSData } from '@/types/arkprts';
import type { Inventory, SaveRecord } from '@/types/planner-types';

type Char = ARKPRTSData["troop"]["chars"]["0"];
type Tmpl = NonNullable<Char["tmpl"]>;

const emit = defineEmits<{
    (e: 'imported'): void;
}>();

const activateAdded = ref(false);

const { lmdId, operators } = storeToRefs(usePlannerStore());
const { exportSavedRecords, getBlankInventory, loadSavedRecords } = usePlannerStore();

const mapARKPRTSModule = (char: Char) => (mod: Module) => {
    const locked = (char.equip[mod.id]?.locked ?? 1) === 1;
    const level = locked ? 0 : char.equip[mod.id]?.level ?? 0;
    const type = mod.type;
    return { type, level };
}

const importData = (is: string) => {
    const data: ARKPRTSData = JSON.parse(is);

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
                currentModules: modules.map(mapARKPRTSModule(char)),
                targetModules: modules.map(mapARKPRTSModule(char)),
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
</script>

<template>
    <ImportExportTab :importData="importData" @imported="emit('imported')">
        <template #import-info>
            <p>
                <a href="https://arkprts.ashlen.top/" target="_blank" rel="noopener noreferrer">ArkPRTS</a> is a tool
                that allows you to pull data right from your Arknights account. You can use it to export your data and
                import it here to save time by not having to manually type your info in.
            </p>
            <p>Click Login and then click "Export full raw data." up top and copy the results into the textbox below.
            </p>
            <p>By default newly imported operators are not set to active since this import can bring in a lot. If you
                would like them all to be active then check the box below.</p>
        </template>
    </ImportExportTab>
</template>

<style scoped></style>