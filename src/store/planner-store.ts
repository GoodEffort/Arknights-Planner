import { ref } from 'vue';
import { defineStore } from 'pinia';
import type Operator from '../types/character';
import type { OperatorPlans } from '../types/plans';
import getChardata from '../data/chardata';

export const usePlannerStore = defineStore('planner', () => {
    const characters = ref<Operator[]>([]);
    const selectedCharacters = ref<Operator[]>([]);
    const plans = ref<{
        [key: string]: OperatorPlans;
    }>({});

    async function loadCharacters() {
        const data = await getChardata();
        characters.value = data;

        if (localStorage.getItem('selectedCharacters')) {
            const selectedIds = JSON.parse(localStorage.getItem('selectedCharacters') || '[]');
            selectedCharacters.value = characters.value.filter(c => selectedIds.indexOf(c.id) >= 0);
        }

        selectedCharacters.value.forEach(c => getPlans(c.id));
    }

    function getPlans(characterId: string) {
        const planString = `plans-${ characterId }`;
        const planData = localStorage.getItem(planString);

        if (planData) {
            plans.value[characterId] = JSON.parse(planData);
        }
        else {
            addNewPlan(characterId);
        }
    }

    function addNewPlan(characterId: string) {
        plans.value[characterId] = {
            operatorId: characterId,
            currentLevel: 1,
            currentElite: 0,
            currentSkillLevels: 1,
            currentSkillMasteries: { skill1: 0, skill2: 0, skill3: 0 },
            currentModules: { x: 0, y: 0, z: 0 },
            targetLevel: 1,
            targetElite: 0,
            targetSkillLevels: 1,
            targetSkillMasteries: { skill1: 0, skill2: 0, skill3: 0 },
            targetModules: { x: 0, y: 0, z: 0 }
        };
    }

    function getImageLink(character: Operator) {
        return `https://raw.githubusercontent.com/Aceship/Arknight-Images/main/avatars/${character.id}.png`;
    }

    function selectCharacter(character: Operator) {
        if (selectedCharacters.value.indexOf(character) < 0) {
            selectedCharacters.value.push(character);
            getPlans(character.id);
        }
        else if (confirm(`Are you sure you want to remove ${ character.name } from your selection?`)) {
            selectedCharacters.value.splice(selectedCharacters.value.indexOf(character), 1);
        }

        localStorage.setItem('selectedCharacters', JSON.stringify(selectedCharacters.value.map(c => c.id)));

        console.log(character);
    }

    return {
        characters,
        selectedCharacters,
        plans,
        loadCharacters,
        getImageLink,
        selectCharacter
    }
});