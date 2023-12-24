<script lang="ts" setup>
import AddOperators from './AddOperators.vue';
import SelectedOperators from './SelectedOperators.vue';
import { usePlannerStore } from '../store/planner-store';
import { onMounted } from 'vue';

const { loadCharacters, loadModules, loadSavedRecords } = usePlannerStore();

onMounted(async () => {
    await Promise.all([loadCharacters(), loadModules()]);
    loadSavedRecords();
});

</script>

<template>
    <div style="height: 100%;">
        <h1>Planner</h1>
        <SelectedOperators />
        <AddOperators />
    </div>
</template>

<style>
html.dark {
    input.form-control, select.form-select, span.input-group-text {
        background-color: #151515;
        color: #fff;
        border: #6e6e6e solid 1px;
    }

    input.form-control::placeholder, input.form-control::-ms-input-placeholder  {
        color: #ffffff;
    }
}
</style>
