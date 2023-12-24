<script setup lang="ts">
const emit = defineEmits<{
    (e: 'update:modelValue', value: number | undefined): number;
}>();

const { modelValue, maxLevel } = defineProps({
    modelValue: Number,
    maxLevel: Number
});

const onChange = (e: Event) => {
    const value = +((e.target as HTMLInputElement).value);
    const max = maxLevel ?? 90;
    if (value > max) {
        emit('update:modelValue', maxLevel);
        return;
    }
    else if (value < 1) {
        emit('update:modelValue', 1);
        return;
    }
        
    emit('update:modelValue', value);
};

</script>

<template>
    <div class="input-group">
        <span class="input-group-text">Level</span>
        <input type="number" class="form-control" :value="modelValue" @input="onChange" min="1" :max="maxLevel" />
    </div>
</template>