<script setup lang="ts">
const emit = defineEmits<{
    (e: 'update:model-value', value: number | undefined): number;
}>();

const { modelValue } = defineProps({
    modelValue: Number,
    moduleLetter: String
});

const onChange = (e: Event) => {
    const value = +((e.target as HTMLInputElement).value);
    if (value > 3) {
        emit('update:model-value', 3);
        return;
    }
    else if (value < 0) {
        emit('update:model-value', 0);
        return;
    }
        
    emit('update:model-value', value);
};

</script>

<template>
    <div class="input-group">
        <span class="input-group-text">{{ moduleLetter }}</span>
        <input type="number" class="form-control" :value="modelValue" @input="onChange" min="0" :max="3" />
    </div>
</template>