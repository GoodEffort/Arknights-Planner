<script setup lang="ts">
const emit = defineEmits<{
    (e: 'update:model-value', value: number | undefined): number;
}>();

const { modelValue } = defineProps({
    modelValue: Number
});

const onChange = (e: Event) => {
    const value = +((e.target as HTMLInputElement).value);
    if (value > 7) {
        emit('update:model-value', 7);
        return;
    }
    else if (value < 1) {
        emit('update:model-value', 1);
        return;
    }
        
    emit('update:model-value', value);
};

</script>

<template>
    <div class="input-group">
        <span class="input-group-text">Skills Level</span>
        <input type="number" class="form-control" :value="modelValue" @input="onChange" min="1" :max="7" />
    </div>
</template>