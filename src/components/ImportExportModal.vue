<script setup lang="ts">
import { computed, ref } from 'vue';
import Modal from './Modal.vue';
import { usePlannerStore } from '../store/planner-store';
import { setImportData } from '../store/store-operator-functions';
import ImportTab from './ImportTab.vue';

const props = defineProps<{
    modelValue: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
}>();

const show = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});
</script>

<template>
  <modal v-model="show">
    <template #header>
      Import or Export Data
    </template>
    <template #body>
        <import-tab @imported="show = false" />
    </template>
    <template #footer>
      <button class="btn btn-danger" @click="show = false">Cancel</button>
    </template>
  </modal>
</template>