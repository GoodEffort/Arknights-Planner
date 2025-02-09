<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { stages } from '@/data/farmingdata';
import { storeToRefs } from 'pinia';
import { usePlannerStore } from '@/store/planner-store';
import CraftButton from '@/components/akplanner/CraftButton.vue';
import ImageFinder from '@/components/akplanner/ImageFinder.vue';

import type { Item } from '@/types/outputdata';

export interface Props {
    item: Item;
    modelValue: number; // count
    controls: boolean;
    craftButton: boolean;
    farming: boolean;
    useInput: boolean;
    flash: boolean;
    disableDecrement?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'show-item', item: Item): void;
    (e: 'update:modelValue', count: number): void;
    (e: 'increment-item', item: Item, count: number): void;
}>();

const qty = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const { lmdId } = storeToRefs(usePlannerStore());

const changeInterval = computed(() => {
    if (props.item.itemId === lmdId.value) {
        return 10000;
    }
    else {
        return 1;
    }
});

const flash = ref(props.flash);

watch(() => qty.value, (newCount, oldCount) => {
    if (newCount !== oldCount && flash.value && props.flash) {
        if (showHighlight.value) {
            showHighlight.value = false;
        }

        setTimeout(() => {
            showHighlight.value = true;
            setTimeout(() => {
                showHighlight.value = false;
            }, 1000);
        }, 0);
    }
    flash.value = props.flash;
});

const showHighlight = ref(false);

</script>

<template>
    <div class="item-col" :class="{ 'highlight-animation': showHighlight }">
        <div class="name">
            <span>
                {{ item.name }}
            </span>
        </div>
        <div class="text-align-end">
            <ImageFinder :subject="item" class="item-image" />
            <CraftButton v-if="controls" :item="item" />
            <div class="bom" v-if="(item.recipe?.costs.length ?? 0 > 0) && craftButton">
                <button @click="emit('show-item', item)" class="btn btn-primary" tabindex="30000">
                    <font-awesome-icon icon="hammer" />
                </button>
            </div>
        </div>
        <div class="count">
            <input v-if="useInput" type="number" class="form-control" min="0" v-model="qty"/>
            <span v-else>
                <b>{{ qty }}</b>
            </span>
            <div v-if="farming">
                <hr class="my-1" />
                {{ stages[item.itemId] ?? 'Craft/Buy' }}
            </div>
        </div>
        <div v-if="!useInput && controls" class="row mb-2">
            <div class="col px-0">
                <button class="btn btn-primary"
                    :disabled="disableDecrement"
                    @click="emit('increment-item', item, -changeInterval)">-{{
                        item.itemId === lmdId ? '10k' : '1' }}</button>
            </div>
            <div class="col px-0">
                <button class="btn btn-primary" @click="emit('increment-item', item, +changeInterval)">+{{
                    item.itemId === lmdId ? '10k' : '1' }}</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.item-image {
    width: 100%;
    height: 5em;
    object-fit: contain;
}

.item-col {
    width: 100%;
    padding: 0px .5em 0px .5em;
    margin-bottom: 1em;
    border-radius: 5px;
    background-color: rgb(197, 197, 197);
}

html.dark>body .item-col {
    background-color: rgb(31, 31, 31);
    border: 1px solid rgb(172, 172, 172);
}

.name {
    font-size: 0.8em;
    height: 3.3em;
    margin-bottom: .5em;
    margin-top: 0px;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    vertical-align: middle;
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

.bom {
    position: relative;
    top: -2.5em;
    right: 70%;
    height: 0px;
    margin-left: 5px;
}

.count {
    margin-top: .25em;
    margin-bottom: .25em;
}

.text-align-end {
    text-align: end;
}

@keyframes highlight {
    0% {
        background: rgb(165, 197, 48)
    }

    100% {
        background: none;
    }
}

.highlight-animation {
    animation: highlight 1s;
}
</style>