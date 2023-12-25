<script setup lang="ts">
const emit = defineEmits<{
    (e: 'update:model-value', value: number | undefined): number;
}>();

const { modelValue } = defineProps<{
    modelValue: Number,
    skillNumber: Number
}>();

const onChange = (e: Event) => {
    const value = +((e.target as HTMLInputElement).value);        
    emit('update:model-value', value);
};

</script>

<template>
    <div class="input-group">
        <span class="input-group-text">{{ skillNumber }}</span>
        <input type="number" class="form-control" :value="modelValue" @input="onChange" min="0" max="3" />
    </div>
</template>