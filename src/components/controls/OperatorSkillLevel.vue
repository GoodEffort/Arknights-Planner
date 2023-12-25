<script setup lang="ts">
import { computed } from 'vue';

const emit = defineEmits<{
    (e: 'update:model-value', value: number | undefined): number;
}>();

const { modelValue, elite } = defineProps<{
    modelValue: number,
    elite: number
}>();

const onChange = (e: Event) => {
    const value = +((e.target as HTMLInputElement).value);
    emit('update:model-value', value);
};

const maxLevel = computed(() => {
    return elite >= 1 ? 7 : 4;
});

</script>

<template>
    <div class="input-group">
        <span class="input-group-text">Skills Level</span>
        <input type="number" class="form-control" :value="modelValue" @input="onChange" min="1" :max="maxLevel" />
    </div>
</template>