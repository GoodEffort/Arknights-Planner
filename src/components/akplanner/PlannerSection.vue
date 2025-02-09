<script lang="ts" setup>
import { getCurrentInstance, ref } from 'vue';
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


    const toggleCol = () => {
        collapsed.value = !collapsed.value;

        if (localStorageId !== '') {
            localStorage.setItem(localStorageId, collapsed.value.toString());
        }
    };

    if (hasBeenOpened.value === false) {
        hasBeenOpened.value = true;
        const instance = getCurrentInstance();
        instance?.proxy?.$forceUpdate();
        setTimeout(toggleCol, 200);
    }
    else {
        toggleCol();
    }
}
</script>

<template>
    <div class="planner-section mt-1 mb-3 pb-2 pt-2" :class="{ open: collapsed }" @click="toggleCollapse">
        <span class="no-text-select">{{ title }}</span>
    </div>

    <Collapse :when="collapsed" :class="{ 'fast-collapse': fastCollapse }">
        <div v-if="hasBeenOpened">
            <slot />
        </div>
    </Collapse>
</template>


<style scoped>
html.dark > body div.planner-section {
    background: #272727;
    border: 2px solid #313131;
    color: #eee;
}

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

.no-text-select {
    user-select: none;
}
</style>
