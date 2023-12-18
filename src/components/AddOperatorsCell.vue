<script lang="ts" setup>
import { PropType, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { usePlannerStore } from '../store/planner-store';
import Character from '../types/character';

const { columnClass, character } = defineProps({
    columnClass: {
        type: String,
        default: 'col-2'
    },
    character: {
        type: Object as PropType<Character>,
        required: true
    }
});

const { getImageLink, selectCharacter } = usePlannerStore();
const { selectedCharacters } = storeToRefs(usePlannerStore());

const isSelected = computed(() => selectedCharacters.value.indexOf(character) >= 0);
</script>

<template>
    <div :class="`character-select ${ columnClass } ${ isSelected ? 'selected' : '' }`" @click="selectCharacter(character)">
        <div>
            <img :src="getImageLink(character)" :alt="character.name" class="img-thumbnail" />
        </div>
        {{ character.name }}
    </div>
</template>

<style scoped>
.character-select {
    cursor: pointer;
}

.character-select.selected {
    opacity: .05;
}
</style>