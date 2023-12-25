import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Operator, CharEquip, EquipDict, Module } from '../types/operator';
import { SelectedOperator, SaveRecord } from '../types/operator';
import getChardata from '../data/chardata';
import getModuledata from '../data/moduledata';
import getItemdata from '../data/itemdata';
import { ExpItem, Item } from '../types/item';

export const usePlannerStore = defineStore('planner', () => {
    const operators = ref<Operator[]>([]);
    const modules = ref<EquipDict>({});
    const charactersToModules = ref<CharEquip>({});
    const selectedOperators = ref<SelectedOperator[]>([]);
    const items = ref<{ [key: string]: Item }>({});
    const expItems = ref<{ [key: string]: ExpItem }>({});

    async function loadCharacters() {
        const data = await getChardata();
        operators.value = data;
    }

    async function loadModules() {
        const { ModuleDict, CharacterModules } = await getModuledata();
        modules.value = ModuleDict;
        charactersToModules.value = CharacterModules;
    }

    async function loadItems() {
        const data = await getItemdata();
        items.value = data.items;
        expItems.value = data.expItems;
    }

    function getModulesForCharacter(operatorId: string): Module[] {
        const moduleIds = charactersToModules.value[operatorId] || [];
        const modulesArray: Module[] = [];
        for (const moduleId of moduleIds) {
            const module = modules.value[moduleId];
            if (module && module.type !== 'INITIAL') {
                modulesArray.push(module);
            }
        }
        return modulesArray;
    }

    function loadSavedRecords() {
        const saveData: string | null = localStorage.getItem('selectedCharacters');
        if (saveData) {
            const operatorIds: string[] = JSON.parse(saveData);

            for (const operatorId of operatorIds) {

                const saveRecord = getSavedOperatorData(operatorId) || new SelectedOperator(operators.value.find(c => c.id === operatorId)!, getModulesForCharacter(operatorId));
                selectedOperators.value.push(saveRecord);
            }
        }
    }

    function getSavedOperatorData(operatorId: string): SelectedOperator {
        const saveString = `plans-${ operatorId }`;
        const saveData: string | null = localStorage.getItem(saveString);
        const operator = operators.value.find(c => c.id === operatorId);
        const modulesarray = getModulesForCharacter(operatorId);

        if (operator === undefined) {
            throw new Error(`Operator with id ${ operatorId } not found.`);
        }

        let selectedOperator: SelectedOperator;

        if (saveData) {
            const SaveRecord: SaveRecord = JSON.parse(saveData);
            selectedOperator = new SelectedOperator(operator, modulesarray, SaveRecord.plans);
        }
        else {
            selectedOperator = new SelectedOperator(operator, modulesarray);
            localStorage.setItem(saveString, JSON.stringify(new SaveRecord(selectedOperator)));
        }

        return selectedOperator
    }

    function getOperatorImageLink(character: Operator) {
        return `https://raw.githubusercontent.com/Aceship/Arknight-Images/main/avatars/${character.id}.png`;
    }

    function getItemImageLink(item: Item) {
        return `https://raw.githubusercontent.com/Aceship/Arknight-Images/main/items/${item.iconId}.png`;
    }

    function selectCharacter(character: Operator) {
        const existingSelection = selectedOperators.value.find(c => c.operator === character);
        if (existingSelection === undefined) {
            const newOperatorSelection = getSavedOperatorData(character.id);
            selectedOperators.value.push(newOperatorSelection);
        }
        else if (confirm(`Are you sure you want to remove ${ character.name } from your selection?`)) {
            selectedOperators.value.splice(selectedOperators.value.indexOf(existingSelection), 1);
        }

        localStorage.setItem('selectedCharacters', JSON.stringify(selectedOperators.value.map(c => c.operator.id)));

        console.log(character);
    }

    return {
        operators,
        modules,
        items,
        expItems,
        selectedOperators,
        loadCharacters,
        loadModules,
        loadItems,
        loadSavedRecords,
        getOperatorImageLink,
        getItemImageLink,
        selectCharacter
    }
});