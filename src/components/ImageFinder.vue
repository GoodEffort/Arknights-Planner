<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { Item } from '../types/item';
import { Operator } from '../types/operator';

async function getOperatorImageLink(character: Operator) {
    // one of these should work... hopefully
    const primarySource = "https://raw.githubusercontent.com/Aceship/Arknight-Images/main/avatars/";
    const secondarySource = "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets/cn/assets/torappu/dynamicassets/arts/charavatars/";

    let primary = true;

    try {
        primary = (await fetch(`${primarySource}${character.id}.png`)).ok;
    }
    catch (e) {
        primary = false;
    }

    return `${primary ? primarySource : secondarySource}${character.id}.png`;
}

async function getItemImageLink(item: Item) {
    // one of these should work... hopefully
    const primarySource = "https://raw.githubusercontent.com/Aceship/Arknight-Images/main/items/";
    const secondarySource = "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets/cn/assets/torappu/dynamicassets/arts/items/icons/";

    let primary = true;

    try {
        // ignore 404 errors from this fetch in the console
        // it is just checking if the primary image source is valid
        // if not, it will use the secondary source
        primary = (await fetch(`${primarySource}${item.iconId}.png`)).ok;
    }
    catch (e) {
        primary = false;
    }

    return `${primary ? primarySource : secondarySource}${item.iconId}.png`;
}

export interface Props {
    subject: Item | Operator;
    class?: string;
}

const props = defineProps<Props>();

const setLink = async () => {
    if ('itemId' in props.subject) {
        link.value = await getItemImageLink(props.subject);
    }
    else {
        link.value = await getOperatorImageLink(props.subject);
    }
};

const link = ref<string>("");

watch(() => props.subject, async () => {
    await setLink();
});

onMounted(async () => {
    await setLink();
});
</script>

<template>
    <img :src="link" :alt="props.subject.name" :title="props.subject.name" class="img-thumbnail" :class="class" />
</template>