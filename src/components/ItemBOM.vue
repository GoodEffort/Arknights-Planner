<script setup lang="ts">
import { computed, ref } from 'vue';
import type { TreeNode } from '../types/bomtree';
import type { Item } from '../types/outputdata';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import CraftButton from './CraftButton.vue';
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';

const { inventory } = storeToRefs(usePlannerStore());

const props = defineProps<{
    tree: TreeNode;
    level?: number;
}>();

const level = ref(props.level ?? 0);
const item = computed<Item>(() => props.tree.item);
const count = computed<number>(() => props.tree.count);
const children = computed<TreeNode[]>(() => props.tree.children.sort((a, b) => {
    const aChildDif = a.children.length === 0 ? -1 : 1;
    const bChildDif = b.children.length === 0 ? -1 : 1;
    if (aChildDif !== bChildDif) {
        return aChildDif - bChildDif;
    }
    else {
        return a.item.sortId - b.item.sortId;
    }
}));
const show = ref(level.value === 0);
const notEnough = computed<boolean>(() => {
    return count.value > inventory.value[item.value.itemId];
});
</script>

<template>
    <div class="row text-start bor-bot py-1 user-select-none" @click="show = !show" :class="{ warning: notEnough && level>0 }">
        <div v-for="i in level" class="col-auto" :class="`${i > 1 ? 'bor-left' : ''}`">
            &nbsp;
        </div>
        <div :class="`col ${level > 0 ? 'bor-left' : ''}`">
            <span>
                <span v-if="children.length > 0">
                    <font-awesome-icon :icon="show ? 'caret-down' : 'caret-right'" />
                </span>
                <span>&nbsp;{{ item.name }} x{{ count }}</span>
            </span>
        </div>
        <div class="col-auto d-none d-lg-block">
            Inventory: {{ inventory[item.itemId] }}
        </div>
        <div class="col-2 text-end">
            <CraftButton @click.stop :item="item" />
        </div>
    </div>
    <Transition v-for="child in children">
        <div v-if="show">
            <ItemBOM :tree="child" :level="level + 1" :key="child.item.itemId + '-' + level" />
        </div>
    </Transition>
</template>

<style scoped>
.v-move,
.v-enter-active,
.v-leave-active {
    transition: 0.1s ease-in-out;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
    transform: translateY(10px);
}

html.dark .list-group-item {
    background-color: #252525;
    color: white;
}

.row.text-start {
    @media screen and (min-width: 992px) {
        font-size: 1.5em;
    }

    @media screen and (max-width: 992px) {
        font-size: 1.25em;
    }
}

.row.bor-bot {
    border-bottom: 1px solid #3d3d3d;
    cursor: pointer;
}

html.dark .row.bor-bot:hover {
    background-color: #464646;
}

.row.bor-bot:hover {
    background-color: #b4aedf;
}

.row.warning {
    background-color: rgba(229, 255, 0, 0.4);
}
</style>