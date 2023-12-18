<script setup lang="ts">
import { defineProps } from 'vue';

const emit = defineEmits<{
    (e: 'update:modelValue', value: number | undefined): number;
}>();

const { modelValue } = defineProps({
    modelValue: Number,
    skillNumber: Number
});

const onChange = (e: Event) => {
    const value = +((e.target as HTMLInputElement).value);
    if (value > 3) {
        emit('update:modelValue', 3);
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
        <span class="input-group-text">Mastery {{ skillNumber }}</span>
        <input type="number" class="form-control" :value="modelValue" @input="onChange" min="1" :max="3" />
    </div>
</template>