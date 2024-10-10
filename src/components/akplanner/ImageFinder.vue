<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Item, Operator } from '@/types/outputdata';

const operatorSources = [
    "https://goodeffort.github.io/Arknights-Planner-Data/images/operators/{id}.webp",
    "https://raw.githubusercontent.com/Aceship/Arknight-Images/main/avatars/{id}.png",
    "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets/cn/assets/torappu/dynamicassets/arts/charavatars/{id}.png",
    "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets/cn/assets/torappu/dynamicassets/arts/charportraits/{id}_2.png"
];

const itemSources = [
    "https://goodeffort.github.io/Arknights-Planner-Data/images/items/{id}.webp",
    "https://raw.githubusercontent.com/Aceship/Arknight-Images/main/items/{id}.png",
    "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets/cn/assets/torappu/dynamicassets/arts/items/icons/{id}.png"
];

const errorIndex = ref(0);
const type = computed(() => 'itemId' in props.subject ? 'item' : 'operator');

const onError = () => {
    errorIndex.value++;
};

export interface Props {
    subject: Item | Operator;
    class?: string;
}

const props = defineProps<Props>();

const link = computed<string>(() => {
    const isItem = type.value === 'item';
    const subject = props.subject as Item & Operator;

    let baseURL = (isItem ? itemSources[errorIndex.value] : operatorSources[errorIndex.value])
        ?? "images/other/missing.webp";

    return baseURL.replace('{id}', isItem ? subject.iconId : subject.id);
});

watch(() => props.subject, () => {
    errorIndex.value = 0;
});
</script>

<template>
    <img :src="link" :alt="props.subject.name" :title="props.subject.name" class="img-thumbnail" :class="class"
        @error="onError" />
</template>

<style scoped>
img {
    object-fit: cover;
    object-position: top
}
</style>