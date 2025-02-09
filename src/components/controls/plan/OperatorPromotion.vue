<script setup lang="ts">
import { ref } from 'vue';
import { Promotion } from '@/types/outputdata';

defineEmits<{
    (e: 'update:model-value', value: number): void;
}>();

const { modelValue, promotions } = defineProps<{
    modelValue: Number,
    promotions: Array<Promotion>
}>();

const disabled = ref(promotions ? promotions.length == 1 : false);
const showElite1 = ref(promotions ? promotions.length > 1 : false);
const showElite2 = ref(promotions ? promotions.length > 2 : false);

</script>

<template>
    <div class="input-group d-none d-lg-flex">
        <span class="input-group-text">Promotion</span>
        <select class="form-select" :value="modelValue" @input="$emit('update:model-value', +($event.target as HTMLSelectElement).value)" :disabled="disabled">
            <option value="0">Elite 0</option>
            <option v-if="showElite1" value="1">Elite 1</option>
            <option v-if="showElite2" value="2">Elite 2</option>
        </select>
    </div>
    <div class="d-lg-none">
        <select class="form-select" :value="modelValue" @input="$emit('update:model-value', +($event.target as HTMLSelectElement).value)" :disabled="disabled">
            <option value="0">Elite 0</option>
            <option v-if="showElite1" value="1">Elite 1</option>
            <option v-if="showElite2" value="2">Elite 2</option>
        </select>
    </div>
</template>