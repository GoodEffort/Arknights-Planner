<script lang="ts" setup>
import { ref } from 'vue';
import { Collapse } from 'vue-collapsed'

const { title, initialState } = defineProps({
    title: String,
    initialState: {
        type: Boolean,
        default: false
    }
});

const collapsed = ref(initialState);

function toggleCollapse() {
    collapsed.value = !collapsed.value;
}
</script>

<template>
    <div class="planner-section mt-1 mb-3 pb-2 pt-2" :class="{ open: collapsed }" @click="toggleCollapse">
        <span>{{ title }}</span>
    </div>

    <Collapse :when="collapsed">
        <slot />
    </Collapse>
</template>

<style scoped>
html.dark .planner-section {
    background: #151515;
}

.planner-section {
    border-radius: 3px;
    font-size: x-large;
    cursor: pointer;
    background: #e0e0e0;
}

.planner-section::before {
    content: "►";
    font-style: normal;
    font-weight: 400;
    text-decoration: inherit;
    float: left;
    padding-left: 10px;
}

.planner-section.open::before {
    content: "▼";
}

.planner-section span {
    margin-left: -10px;
}
</style>
