<script setup lang="ts">
import { Item } from '../types/item';
import ImageFinder from './ImageFinder.vue';

defineProps<{
    item: Item;
    count: number;
}>();

</script>

<template>
    <div class="col-2">
        <div>
            <ImageFinder :subject="item" class="item-image" />
        </div>
        <div class="name">
            {{ item.name }}
        </div>
        <div class="count">
            {{ count }}
        </div>
    </div>
</template>

<style scoped>
.item-image {
    max-width: 50px;
    max-height: 50px;
    object-fit: contain;
}
</style>