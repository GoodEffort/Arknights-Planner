<script setup lang="ts">
import { computed, ref } from 'vue';
import Modal from './Modal.vue';
import importArkPRTSData from '../data/arkprts-to-record';
import type { ArkPrtsCharacter, ArkPrtsCharacterList } from '../types/arkprts'
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const { operators } = storeToRefs(usePlannerStore());
const { exportSavedRecords, getBlankInventory, importSavedRecords, loadSavedRecords } = usePlannerStore();

const characters = ref('');
const items = ref('');
const lmd = ref('');

const verifyCharacters = () => {
  try {
    const json: ArkPrtsCharacterList = JSON.parse(characters.value);
    for (const operatorId in json) {
        const operator: ArkPrtsCharacter = json[operatorId];
        if (operator.promotion !== 0 && operator.promotion !== 1 && operator.promotion !== 2) {
            return false;
        }
        else if (operator.level < 1 || operator.level > 90) {
            return false;
        }
        else if (operator.skillLevel < 1 || operator.skillLevel > 7) {
            return false;
        }
        else if (!Array.isArray(operator.mastery)) {
            return false;
        }
        else if (!Array.isArray(operator.module)) {
            return false;
        }
    }
    return json;
  } catch (e) {
    return false;
  }
};

const verifyItems = () => {
    const lines = items.value.split('\n');
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

const importData = () => {
    const arkprtsCharacters = verifyCharacters();
    if (!!arkprtsCharacters && verifyItems()) {
        const existingRecords = exportSavedRecords();
        const blankInventory = getBlankInventory();
        const itemscsv = items.value + '\n' + '4001,' + lmd.value;
        
        const arkprtsimport = importArkPRTSData(arkprtsCharacters, operators.value, existingRecords.p, itemscsv, blankInventory);

        importSavedRecords(JSON.stringify(arkprtsimport));
        loadSavedRecords();

        show.value = false;
    }
    else {
        alert('Invalid data');
    }
};

</script>

<template>
<modal v-model="show">
    <template #header>
        Import Data using ArkPRTS
    </template>
    <template #body>
        <div>
            <p class="text-start">
                <a href="https://arkprts.ashlen.top/" target="_blank" rel="noopener noreferrer">ArkPRTS</a> is a tool that allows you to pull data right from your Arknights account. You can use it to export your data and import it here to save time by not having to manually type your info in.
                <br/>
                <br/>
                This will keep your "target plans" for operators and modules, but will overwrite your inventory and "current plans" for operators. If the "current" values are greater than the target values, the target values will be set to the current values.
                <br/>
                <br/>
                To use it click login at the top, then follow the instructions to login.
                <br/>
                <br/>
                <b>
                    MODULES: If you have modules that are not in the game yet on an existing plan they will be ignored in the import! You will need to manually adjust those after the import if they have changed.
                </b>
                Also double check any operators that currently have modules that are not in the game yet if you have leveled up other modules, I need to test if the order is always the same coming from ArkPRTS.
                <br/>
                <br/>
                <ul>
                    <li>
                        Once you are logged in, click the "Copy!" button at the top of the page for "Export charaters to krooster (local storage)" and paste that into the Character import box below.
                    </li>
                    <li>
                        Then click the "Copy!" buttoon by the "Export items to krooster (csv)" and paste that into the Items import box below.
                    </li>
                    <li>
                        Also fill out the amount of LMD you have in the LMD box, this is not included in the items export for Krooster unfortunately.
                    </li>
                    <li>
                        Finally click the "Import" button below to import your data directly from your profile.
                    </li>
                </ul>
            </p>
        </div>
        <div class="container">
            <div class="row">
                <div class="input-group mb-3">
                    <span class="input-group-text">LMD</span>
                    <input type="text" class="form-control" v-model="lmd" placeholder="Paste LMD Amount here" />
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <label for="arkprts-characters">Characters</label>
                    <textarea id="arkprts-characters" class="form-control" rows="10" v-model="characters"></textarea>
                </div>
                <div class="col">
                    <label for="arkprts-items">Items</label>
                    <textarea id="arkprts-items" class="form-control" rows="10" v-model="items"></textarea>
                </div>
            </div>
        </div>
    </template>
    <template #footer>
        <button class="btn btn-primary" @click="importData">Import</button>
        <button class="btn btn-danger" @click="show = false">Close</button>
    </template>
</modal>
</template>