<script lang="ts" setup>
import AddOperators from './AddOperators.vue';
import SelectedOperators from './SelectedOperators.vue';
import { usePlannerStore } from '../store/planner-store';
import { onMounted, ref } from 'vue';
import { DotLoader } from "vue3-spinner";

const { loadCharacters, loadModules, loadSavedRecords } = usePlannerStore();

const isLoading = ref(true);

onMounted(async () => {
    await Promise.all([loadCharacters(), loadModules()]);
    loadSavedRecords();
    isLoading.value = false;
});

</script>

<template>
    <div style="height: 100%;">
        <h1>Planner</h1>
        <div v-if="!isLoading">
            <SelectedOperators />
            <AddOperators />
        </div>
        <DotLoader v-else />
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
