<script setup lang="ts">
import { usePlannerStore } from '../store/planner-store';
import { Item } from '../types/item';

defineProps<{
    item: Item;
    count: number;
}>();

const { getItemImageLink } = usePlannerStore();
</script>

<template>
    <div class="col-2">
        <div>
            <img :src="getItemImageLink(item)" :alt="item.name" class="img-thumbnail item-image" />
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