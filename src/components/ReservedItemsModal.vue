<script setup lang="ts">
import { computed } from 'vue';
import Modal from './Modal.vue';
import ItemsDisplay from './ItemsDisplay.vue';

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
            Reserved Items
        </template>
        <template #body>
            <ItemsDisplay :reservedItems="true" :controls="false" :craftButton="false" />
        </template>
        <template #footer>
            <button class="btn btn-danger" @click="show = false">Close</button>
        </template>
    </modal>
</template>