<script lang="ts" setup>
import { ref } from 'vue';
import { Collapse } from 'vue-collapsed'

const { title, initialState, localStorageId, fastCollapse } = defineProps({
    title: String,
    fastCollapse: {
        type: Boolean,
        default: true
    },
    initialState: {
        type: Boolean,
        default: false
    },
    localStorageId: {
        type: String,
        default: ''
    }
});

let state = initialState;

if (localStorageId !== '') {
    const localStorageState = localStorage.getItem(localStorageId);
    if (localStorageState !== null) {
        state = localStorageState === 'true';
    }
}

const collapsed = ref(state);
const hasBeenOpened = ref(collapsed.value);

function toggleCollapse() {
    collapsed.value = !collapsed.value;
    hasBeenOpened.value = true;

    if (localStorageId !== '') {
        localStorage.setItem(localStorageId, collapsed.value.toString());
    }
}
</script>

<template>
    <div class="planner-section mt-1 mb-3 pb-2 pt-2" :class="{ open: collapsed }" @click="toggleCollapse">
        <span>{{ title }}</span>
    </div>

    <Collapse :when="collapsed" :class="{ 'fast-collapse': fastCollapse }">
        <div v-if="hasBeenOpened">
            <slot />
        </div>
    </Collapse>
</template>


<style scoped>
.planner-section {
    border-radius: 3px;
    font-size: x-large;
    cursor: pointer;
    background: #cccccc;
    color: black;
}

.planner-section::before {
    content: "▸";
    font-style: normal;
    font-weight: 400;
    text-decoration: inherit;
    float: left;
    padding-left: 10px;
}

.planner-section.open::before {
    content: "▾";
}

.planner-section span {
    margin-left: -10px;
}

.fast-collapse {
    transition: height 300ms ease-in-out;
}
</style>
