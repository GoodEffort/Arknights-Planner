<script setup lang="ts">
import Modal from './Modal.vue';
import NightModeToggle from './NightModeToggle.vue';
import { ref } from 'vue';
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import { SaveRecord } from '../types/operator';

const store = usePlannerStore();
const { exportSavedRecords, loadSavedRecords } = store;
const { exportString, inventory, selectedOperators } = storeToRefs(store);

const showCreditsmodal = ref(false);
const showExportModal = ref(false);
const showImportModal = ref(false);
const importString = ref('');

const exportData = () => {
  exportSavedRecords();
  showExportModal.value = true;
};

const copyToClipboard = () => {
  navigator.clipboard.writeText(exportString.value);
  showExportModal.value = false;
};

const importData = () => {
  if (importString.value === '' || importString.value == null) {
    alert('Please paste data to import');
    return;
  }

  const data: {
    p: SaveRecord[];
    s: string[];
    i: { [key: string]: number };
  } = JSON.parse(importString.value);

  if (data == null || !Array.isArray(data.p) || !Array.isArray(data.s) || data.i == null) {
    alert('Invalid data format');
    return;
  }

  localStorage.setItem('selectedCharacters', JSON.stringify(data.s));
  localStorage.setItem('inventory', JSON.stringify(data.i));

  const saveRecords = data.p;
  for (const op of saveRecords) {
    const saveString = `plans-${op.operatorId}`;
    localStorage.setItem(saveString, JSON.stringify(op));
  }

  selectedOperators.value = [];

  inventory.value = data.i;
  loadSavedRecords();
}
</script>

<template>
  <nav class="navbar navbar-expand-lg fixed-top">
    <div>
      <night-mode-toggle />
    </div>
    <div>
      <button class="btn btn-primary" @click="exportData">
        <font-awesome-icon icon="download"  />
      </button>
      <button class="btn btn-primary" @click="showImportModal = !showImportModal">
        <font-awesome-icon icon="upload"  />
      </button>
      <button class="btn btn-secondary" @click="showCreditsmodal = !showCreditsmodal">
        <font-awesome-icon icon="info-circle"  />
      </button>
    </div>
  </nav>

  <modal v-if="showCreditsmodal" @close="showCreditsmodal = false">
    <template #header>
      Data Source Credits
    </template>
    <template #body>
      <div>
        <div>(Currently using)</div>
        <div>- https://github.com/Kengxxiao/ArknightsGameData_YoStar</div>
        <div>- https://github.com/Aceship/Arknight-Images</div>
        <div>- https://github.com/Kengxxiao/ArknightsGameData</div>
        <div>- https://docs.google.com/spreadsheets/d/12X0uBQaN7MuuMWWDTiUjIni_MOP015GnulggmBJgBaQ/</div>
        <div>- https://ak.gamepress.gg/news/arknights-material-farming-efficiency-best-stages-farm</div>
      </div>
    </template>
  </modal>

  <modal v-if="showExportModal" @close="showExportModal = false">
    <template #header>
      Export Data
    </template>
    <template #body>
      <div>
        <textarea rows="10" cols="50" readonly>
          {{ exportString }}
        </textarea>
      </div>
    </template>
    <template #footer>
      <button class="btn btn-success" @click="copyToClipboard">Copy To Clipboard</button>
    </template>
  </modal>

  <modal v-if="showImportModal" @close="showImportModal = false">
    <template #header>
      Import Data
    </template>
    <template #body>
      <div>
        <b>This will overwrite all data currently on the page with what you paste below!</b>
        <textarea rows="10" cols="50" v-model="importString">
        </textarea>
      </div>
    </template>
    <template #footer>
      <button class="btn btn-success" @click="importData">Import Data</button>
    </template>
  </modal>
</template>

<style scoped>
a:link {
  text-decoration: none;
}

.sidebar {
  box-shadow: 0 2px 5px 0 #0000000d, 0 2px 10px 0 #0000000d;
}

.sidebar .active {
  box-shadow: 0 2px 5px 0 #00000029, 0 2px 10px 0 #0000001f;
}

.sidebar-sticky {
  position: relative;
  top: 0;
  height: calc(100vh - 48px);
  padding-top: 0.5rem;
  overflow-x: hidden;
  overflow-y: auto;
}

nav.navbar {
  justify-content: space-between;
  padding-left: 1em;
  padding-right: 1em;
}

nav.navbar li.nav-item:last-child {
  margin-left: 1em;
}

nav.navbar li.nav-item:not(:last-child)::after {
  margin-left: 1em;
  content: '|';
  display: inline;
  width: 0;
  height: 2px;
  color: white;
  transition: width .3s;
}

nav.navbar li.nav-item.active>a>span {
  color: hsl(25, 70%, 45%);
  border-bottom: hsl(25, 70%, 45%) 2px solid;
}

nav.navbar li.nav-item {
  width: 7em;
}

nav.navbar a.navbar-brand {
  margin-right: 0px;
}

#autoload {
  margin-right: 0.5em;
}

nav.navbar {
  background-color: white;
  border-bottom: 1px solid black;
}
</style>