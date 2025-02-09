<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
    tabs: { title: string, name: string }[];
    defaultTab?: number;
    allowDeselect?: boolean;
    addTab?: boolean;
}>();

const emit = defineEmits<{
    (e: 'changeTab', value: string): void;
    (e: 'addTab', tabName: string): void;
}>();

const selected = ref();

if (props.defaultTab !== undefined) {
    selected.value = props.defaultTab;
}
else if (props.tabs.length >= 0) {
    selected.value = 0;
}

const toggle = (index: number) => {
    if (selected.value === index && props.allowDeselect) {
        selected.value = undefined;
    }
    else {
        selected.value = index;
        emit('changeTab', props.tabs[index].name);
    }
}

const addTab = () => {
    const tabName = prompt('Enter tab name: ');
    
    if (!tabName) {
        return;
    }

    emit('addTab', tabName);
}
</script>

<template>
    <div class="mb-3">
        <div class="row">
            <div class="col">
                <ul class="nav nav-pills nav-fill">
                    <li class="nav-item prevent-select cursor-pointer"  v-for="({ title }, index) in tabs" @click="toggle(index)">
                        <a class="nav-link" :class="{ 'active': index === selected }">{{ title }}</a>
                    </li>
                </ul>
            </div>
            <div v-if="props.addTab" class="col-auto add-tab" @click="addTab">
                <div>
                    <font-awesome-icon icon="plus" size="xl" class="cursor-pointer" transform="down-4 grow-4" />
                </div>
            </div>
        </div>
    </div>
    <template v-for="({ name }, index) in tabs">
        <template v-if="index === selected">
            <slot :name="name" />
        </template>
    </template>
</template>

<style scoped>
.prevent-select {
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}

.cursor-pointer {
  cursor: pointer;
}

.add-tab {
    cursor: pointer;
    border: 1px solid rgb(13, 110, 253);
    border-bottom: 0px;
    border-radius: 5px 5px 0px 0px;
}

.add-tab:hover {
    background-color: rgb(13, 110, 253);
}
</style>