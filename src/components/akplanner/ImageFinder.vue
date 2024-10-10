<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Item, Operator } from '@/types/outputdata';

type URLTree = { [key: string]: false | URLTree };

const os: URLTree = {
    "https://": {
        "goodeffort.github.io/Arknights-Planner-Data/images/operators/{id}.webp": false,
        "raw.githubusercontent.com/": {
            "Aceship/Arknight-Images/main/avatars/{id}.png": false,
            "ArknightsAssets/ArknightsAssets/cn/assets/torappu/dynamicassets/arts/": {
                "charavatars/{id}.png": false,
                "charportraits/{id}_2.png": false
            }
        }
    }
}

const is: URLTree = {
    "https://": {
        "goodeffort.github.io/Arknights-Planner-Data/images/items/{id}.webp": false,
        "raw.githubusercontent.com/": {
            "Aceship/Arknight-Images/main/items/{id}.png": false,
            "ArknightsAssets/ArknightsAssets/cn/assets/torappu/dynamicassets/arts/items/icons/{id}.png": false
        }
    }
};

const buildUrls = (sources: URLTree, urls: string[] = [], base = '') => {
    for (const [key, value] of Object.entries(sources)) {
        if (value === false) {
            urls.push(base + key);
        } else {
            buildUrls(value, urls, base + key);
        }
    }

    return urls;
};

const operatorSources = buildUrls(os);
const itemSources = buildUrls(is);

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