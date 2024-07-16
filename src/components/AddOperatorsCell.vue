<script lang="ts" setup>
import { PropType, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { usePlannerStore } from '../store/planner-store';
import { Operator } from '../types/operator';
import ImageFinder from './ImageFinder.vue';

const { operator } = defineProps({
    operator: {
        type: Object as PropType<Operator>,
        required: true
    }
});

const { selectCharacter } = usePlannerStore();
const { selectedOperators } = storeToRefs(usePlannerStore());

const isSelected = computed(() => selectedOperators.value.find(c => c.operator.id === operator.id) !== undefined);
</script>

<template>
    <div :class="`character-select col-md-2 col-4 ${ isSelected ? 'selected' : '' }`" @click="selectCharacter(operator)">
        <div>
            <ImageFinder :subject="operator" class="img-thumbnail" />
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

.character-select.selected img {
    opacity: .2;
}

.name {
    min-height: 4em;
}
</style>