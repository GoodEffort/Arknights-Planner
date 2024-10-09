<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
    tabs: { title: string, name: string }[];
}>();

const selected: Ref<number | undefined> = ref(0);

const toggle = (index: number) => {
    if (selected.value === index) {
        selected.value = undefined;
    }
    else {
        selected.value = index;
    }
}
</script>

<template>
    <div class="mb-3">
        <ul class="nav nav-pills nav-fill">
            <li class="nav-item prevent-select cursor-pointer"  v-for="({ title }, index) in tabs" @click="toggle(index)">
                <a class="nav-link" :class="{ 'active': index === selected }">{{ title }}</a>
            </li>
        </ul>
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
</style>