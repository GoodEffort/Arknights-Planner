<script setup lang="ts">
import { computed } from 'vue';
import Modal from '@/components/generic/Modal.vue';
import ItemsDisplay from '@/components/akplanner/ItemsDisplay.vue';
import { storeToRefs } from 'pinia';
import { usePlannerStore } from '@/store/planner-store';

const { reservedItems } = storeToRefs(usePlannerStore());

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

</script>

<template>
    <modal v-model="show">
        <template #header>
            Reserved Items
        </template>
        <template #body>
          <p>
            These are the counts of items that are excluded from crafting.
            <br />
            For example, if you reserve 20 Orirock then the crafting section will not suggest crafting Orirock Cubes until you have 23 or more Orirock in your inventory.
          </p>
            <ItemsDisplay 
              v-model="reservedItems"
              :use-input="true"
              :controls="false"
              :craftButton="false"
              :sort="(a, b) => {
                const type = b.item.itemType.localeCompare(a.item.itemType);
                if (type !== 0) {
                  return type;
                }
                const rarity = a.item.rarity.localeCompare(b.item.rarity);
                if (rarity !== 0) {
                  return rarity;
                }
                return a.item.sortId - b.item.sortId;
              }"
            />
        </template>
        <template #footer>
            <button class="btn btn-danger" @click="show = false">Close</button>
        </template>
    </modal>
</template>