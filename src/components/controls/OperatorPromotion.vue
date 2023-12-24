<script setup lang="ts">
import { Phase } from '../../types/operator';
import { ref } from 'vue';

defineEmits<{
    (e: 'update:model-value', value: number): void;
}>();

const { modelValue, phases } = defineProps({
    modelValue: Number,
    phases: Array<Phase>
});

const disabled = ref(phases ? phases.length == 1 : false);
const showElite1 = ref(phases ? phases.length > 1 : false);
const showElite2 = ref(phases ? phases.length > 2 : false);

</script>

<template>
    <div class="input-group">
        <span class="input-group-text">Promotion</span>
        <select class="form-select" :value="modelValue" @input="$emit('update:model-value', +($event.target as HTMLSelectElement).value)" :disabled="disabled">
            <option value="0">Elite 0</option>
            <option v-if="showElite1" value="1">Elite 1</option>
            <option v-if="showElite2" value="2">Elite 2</option>
        </select>
    </div>
</template>