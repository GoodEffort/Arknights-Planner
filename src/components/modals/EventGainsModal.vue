<script setup lang="ts">
import { computed } from 'vue';
import Modal from '@/components/generic/Modal.vue';
import NavTabList from '../generic/NavTabList.vue';
import ItemsDisplay from '@/components/akplanner/ItemsDisplay.vue';
import { storeToRefs } from 'pinia';
import { usePlannerStore } from '@/store/planner-store';
import { getBlankInventoryFromItems } from '@/store/store-operator-functions';

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

const { items, inventory, futureEventGains } = storeToRefs(usePlannerStore());

const tabs = computed(() => {
  let tabno = 0;
  return Object.keys(futureEventGains.value).map((key) => {
    return {
      name: `tab${tabno++}`,
      title: key
    }
  });
});

const addTab = (tabName: string) => {
  const fEvGains = JSON.parse(JSON.stringify(futureEventGains.value));
  fEvGains[tabName] = getBlankInventoryFromItems(items.value);
  futureEventGains.value = fEvGains;
}

const removeTab = (tabName: string) => {
  if (confirm('Are you sure you want to delete this tab?')) {
    const fEvGains = JSON.parse(JSON.stringify(futureEventGains.value));

    delete fEvGains[tabName];

    futureEventGains.value = fEvGains;
  }
}

const applyTab = (tabName: string) => {
  if (confirm('Are you sure you want to apply this event shop?')) {
    for (const [itemId, count] of Object.entries(futureEventGains.value[tabName])) {
      inventory.value[itemId] = (inventory.value[itemId] || 0) + count;
    }

    const fEvGains = JSON.parse(JSON.stringify(futureEventGains.value));

    delete fEvGains[tabName];

    futureEventGains.value = fEvGains;
  }
}
</script>

<template>
  <modal v-model="show">
    <template #header>
      Event Gains Items
    </template>
    <template #body>
      <nav-tab-list :tabs="tabs" :add-tab="true" @add-tab="addTab">
        <template v-for="(tab, index) in tabs" #[`tab${index}`]>
          <button class="btn btn-primary mb-2 me-2" @click="applyTab(tab.title)">Apply Event Shop</button>
          <button class="btn btn-danger mb-2" @click="removeTab(tab.title)">Delete Event</button>
          <ItemsDisplay v-model="futureEventGains[tab.title]" :use-input="true" :controls="false"
            :craftButton="false" />
        </template>
      </nav-tab-list>
    </template>
    <template #footer>
      <button class="btn btn-danger" @click="show = false">Close</button>
    </template>
  </modal>
</template>