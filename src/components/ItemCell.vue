<script setup lang="ts">
import { Item } from '@/types/outputdata';
import ImageFinder from '@/components/ImageFinder.vue';

defineProps<{
    item: Item;
    count: number;
}>();

</script>

<template>
    <div>
        <ImageFinder :subject="item" class="item-image" />
    </div>
    <div class="count">
        {{ count }}
    </div>
</template>

<style scoped>
.item-image {
    width: 50px;
    height: 50px;
    object-fit: contain;
}
</style>