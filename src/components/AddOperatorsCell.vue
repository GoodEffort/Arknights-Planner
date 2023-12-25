<script lang="ts" setup>
import { PropType, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { usePlannerStore } from '../store/planner-store';
import { Operator } from '../types/operator';

const { columnClass, operator } = defineProps({
    columnClass: {
        type: String,
        default: 'col-2'
    },
    operator: {
        type: Object as PropType<Operator>,
        required: true
    }
});

const { getOperatorImageLink, selectCharacter } = usePlannerStore();
const { selectedOperators } = storeToRefs(usePlannerStore());

const isSelected = computed(() => selectedOperators.value.find(c => c.operator.id === operator.id) !== undefined);
</script>

<template>
    <div :class="`character-select ${ columnClass } ${ isSelected ? 'selected' : '' }`" @click="selectCharacter(operator)">
        <div>
            <img :src="getOperatorImageLink(operator)" :alt="operator.name" class="img-thumbnail" />
        </div>
        <div class="name">
            {{ operator.name }}
        </div>
    </div>
</template>

<style scoped>
.character-select {
    cursor: pointer;
}

.character-select.selected {
    opacity: .05;
}

.name {
    min-height: 4em;
}
</style>