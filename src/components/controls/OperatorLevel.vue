<script setup lang="ts">
const emit = defineEmits<{
    (e: 'update:model-value', value: number | undefined): number;
}>();

const { modelValue, maxLevel } = defineProps<{
    modelValue: number;
    maxLevel: number;
    minLevel: number;
}>();

const onChange = (e: Event) => {
    const value = +((e.target as HTMLInputElement).value);        
    emit('update:model-value', value);
};
</script>

<template>
    <div class="input-group">
        <span class="input-group-text ">Level</span>
        <input placeholder="Level" type="number" class="form-control" :value="modelValue" @input="onChange" :min="minLevel" :max="maxLevel" />
    </div>
</template>