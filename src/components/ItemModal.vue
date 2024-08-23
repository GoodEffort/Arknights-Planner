<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Modal from './Modal.vue';
import { Item } from '../types/outputdata';
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import { TreeNode } from '../types/bomtree';
import ItemBOM from './ItemBOM.vue';

const { items, lmdId } = storeToRefs(usePlannerStore());

const props = defineProps<{
    modelValue: Item | undefined;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: Item | undefined): void;
}>();

const showModal = ref(false);

watch(() => props.modelValue, (value) => {
    showModal.value = value !== undefined;
});

watch(() => showModal.value, (value) => {
    if (!value) {
        emit('update:modelValue', undefined);
    }
});

const selectedItem = computed(() => {
    return props.modelValue;
});

const bomTree = computed(() => {
    const item = selectedItem.value;
    if (!item) {
        return undefined;
    }

    const tree: TreeNode = {
        item,
        count: 1,
        children: []
    };

    const itemIds: string[] = [tree.item.itemId, lmdId.value];

    const addChildren = (node: TreeNode) => {
        const item = node.item;
        const costs = items.value[item.itemId].recipe?.costs ?? [];
        for (const cost of costs) {
            if (itemIds.includes(cost.id)) {
                continue;
            }
            else {
                itemIds.push(cost.id);
            }
            const childItem = items.value[cost.id];
            const childNode: TreeNode = {
                item: childItem,
                count: cost.count,
                children: []
            };
            node.children.push(childNode);

            addChildren(childNode);
            // itemIds should only track the current branch
            itemIds.pop();
        }
    };

    addChildren(tree);
    return tree;
});

</script>

<template>
    <modal v-model="showModal">
        <template #header>
            {{ selectedItem?.name }}
        </template>
        <template #body>
            <div>
                <div>
                    <p>
                        {{ selectedItem?.description }}
                    </p>
                </div>
                <div class="container">
                    <ItemBOM v-if="bomTree" :tree="bomTree" />
                </div>
            </div>
        </template>
        <template #footer>
            <button @click="showModal = false">Close</button>
        </template>
    </modal>
</template>