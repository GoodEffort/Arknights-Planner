<script setup lang="ts">
import { debounce } from 'lodash';

const emit = defineEmits<{
    (e: 'update:model-value', value: number | undefined): number;
}>();

const { modelValue } = defineProps<{
    modelValue: number,
    label: string,
    min: number
}>();

const onChange = debounce((e: Event) => {
    const value = +((e.target as HTMLInputElement).value);
    emit('update:model-value', value);
}, 250);

</script>

<template>
    <div class="input-group">
        <span class="input-group-text">{{ label }}</span>
        <input type="number" class="form-control" :value="modelValue" @input="onChange" :min="min" max="3" />
    </div>
</template>