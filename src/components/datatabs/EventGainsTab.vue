<script setup lang="ts">
import { usePlannerStore } from '@/store/planner-store';
import { storeToRefs } from 'pinia';
import ImportExportTab from '@/components/datatabs/ImportExportTab.vue';
import type { EventGains, Inventory } from '@/types/planner-types';

type EventGainsImport = {
    [key: string]: {
        tabName: string;
        id_number: string;
        items: Inventory;
    }[];
}

const emit = defineEmits<{
  (e: 'imported'): void;
}>();

const { futureEventGains } = storeToRefs(usePlannerStore());

const importData = (is: string) => {
  const importDataObject = JSON.parse(is) as EventGainsImport;

  const eg: EventGains = JSON.parse(JSON.stringify(futureEventGains.value));

  for (const event in importDataObject) {
    for (const tab of importDataObject[event]) {
      eg[tab.tabName] = tab.items;
    }
  }

  futureEventGains.value = eg;
};
</script>

<template>
  <ImportExportTab :importData="importData" @imported="emit('imported')">
    <template #import-info>
      <p>Paste data from <a href="https://docs.google.com/spreadsheets/d/1b0YZvhaHeOlUrG8BEBBi35M-9NZh_0N0/edit?gid=1392278548#gid=1392278548">[AqVR] Arknights - Event Gains Calculator</a></p>
    </template>
  </ImportExportTab>
</template>