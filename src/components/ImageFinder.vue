<script setup lang="ts">
import { ref } from 'vue';
import { usePlannerStore } from '../store/planner-store';
import { Item } from '../types/item';
import { Operator } from '../types/operator';
const { getItemImageLink, getOperatorImageLink } = usePlannerStore();

export interface Props {
    subject: Item | Operator;
}

const props = defineProps<Props>();

const getLink = async () => {
    if ('itemId' in props.subject) {
        return await getItemImageLink(props.subject);
    }
    else {
        return await getOperatorImageLink(props.subject);
    }
};

const link = ref<string>("https://github.com/ArknightsAssets/ArknightsAssets/blob/cn/assets/torappu/dynamicassets/arts/%5Bpack%5Dcmgachapool/pack2/spine_bk.png");

getLink().then(result => {
    link.value = result;
});
</script>

<template>
    <img :src="link" :alt="props.subject.name" class="img-thumbnail" :class="class" />
</template>