<script setup lang="ts">
import Modal from './Modal.vue';
import NightModeToggle from './NightModeToggle.vue';
import { ref, watch } from 'vue';
import { usePlannerStore } from '../store/planner-store';
import { storeToRefs } from 'pinia';
import { SaveRecord } from '../types/operator';

const store = usePlannerStore();
const { exportSavedRecords, loadSavedRecords, getBlankInventory } = store;
const { exportString, inventory, selectedOperators } = storeToRefs(store);

const lastUse = new Date(localStorage.getItem('last-use-timestamp') ?? 0);

const showCreditsmodal = ref(false);
const showExportModal = ref(false);
const showImportModal = ref(false);
const importString = ref('');
const showNewFeaturesModal = ref(lastUse < new Date(BUILD_DATE));
const doNotShowAgain = ref(localStorage.getItem('do-not-show-again') === 'true');

watch(doNotShowAgain, (val) => {
  localStorage.setItem('do-not-show-again', val.toString());
});

const exportData = () => {
  exportSavedRecords();
  showExportModal.value = true;
};

const copyToClipboard = () => {
  navigator.clipboard.writeText(exportString.value);
  showExportModal.value = false;
};

const pasteFromClipboard = async () => {
  const text = await navigator.clipboard.readText();
  importString.value = text;
};

const closeNewFeaturesModal = () => {
  showNewFeaturesModal.value = false;
  localStorage.setItem('last-use-timestamp', new Date().toISOString());
};

const importData = () => {
  if (importString.value === '' || importString.value == null) {
    alert('Please paste data to import');
    return;
  }

  let data: {
    p: SaveRecord[];
    s: string[];
    i: { [key: string]: number };
  };

  try {
    data = JSON.parse(importString.value);
  }
  catch (e) {
    alert('Invalid data format');
    return;
  }

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

  inventory.value = { ...getBlankInventory(), ...data.i };
  loadSavedRecords();

  showImportModal.value = false;
  importString.value = '';
}
</script>

<template>
  <nav class="navbar navbar-expand-lg fixed-top">
    <div>
      <a class="navbar-brand" href="#" @click="showNewFeaturesModal = true">Arknights Planner</a>
    </div>
    <div>
    </div>
    <div>
      <div class="btn-group" role="group">
        <button class="btn btn-primary" @click="exportData">
          <font-awesome-icon icon="download" />
          <span class="d-none d-md-inline"> Export</span>
        </button>
        <button class="btn btn-primary" @click="showImportModal = !showImportModal">
          <font-awesome-icon icon="upload" />
          <span class="d-none d-md-inline"> Import</span>
        </button>
        <a href="https://arknights.wiki.gg/wiki/Event" target="_blank" class="btn btn-primary text-light">
          <font-awesome-icon icon="calendar-day" />
          <span class="d-none d-md-inline"> Upcoming Events</span>
        </a>
        <night-mode-toggle />
        <button class="btn btn-secondary" @click="showCreditsmodal = !showCreditsmodal">
          <font-awesome-icon icon="info-circle" />
        </button>
      </div>
    </div>
  </nav>

  <modal v-model="showCreditsmodal">
    <template #header>
      Data Source Credits
    </template>
    <template #body>
      <div>
        <div>This calculator was made by Luke Hovarter</div>
        <div>Find me on <a href="https://github.com/GoodEffort">GitHub</a>!</div>
        <div>Repository here: <a href="https://github.com/GoodEffort/Arknights-Planner">Arknights-Planner</a></div>

        <div class="mt-4">Thanks to the following sources for data:</div>
        <div>
          <a href="https://github.com/Kengxxiao/ArknightsGameData_YoStar">Kengxxiao's Yostar info</a>
        </div>

        <div>
          <a href="https://github.com/Kengxxiao/ArknightsGameData">Kengxxiao's CN client info</a>
        </div>
        <div>
          <a href="https://github.com/Aceship/Arknight-Images">Aceship for images</a>
        </div>
        <div>
          <a href="https://github.com/ArknightsAssets/ArknightsAssets">ArknightsAssets for images</a>
        </div>
        <div>
          <a href="https://docs.google.com/spreadsheets/d/12X0uBQaN7MuuMWWDTiUjIni_MOP015GnulggmBJgBaQ/">This super
            impressive Google Sheet of most efficient maps by momo.moe / u/elmoe0715</a>
        </div>
      </div>
      <div>
        <a href="https://ak.gamepress.gg/news/arknights-material-farming-efficiency-best-stages-farm">Gamepress for
          material farming efficiency quick reference</a>
      </div>
    </template>
    <template #footer>
      <button class="btn btn-danger" @click="showCreditsmodal = false">Close</button>
    </template>
  </modal>

  <modal v-model="showExportModal">
    <template #header>
      Export Data
    </template>
    <template #body>
      <div>
        <textarea rows="10" cols="50" readonly>{{ exportString }}</textarea>
      </div>
    </template>
    <template #footer>
      <button class="btn btn-danger" @click="showExportModal = false">Cancel</button>
      <button class="btn btn-success" @click="copyToClipboard">Copy To Clipboard</button>
    </template>
  </modal>

  <modal v-model="showImportModal">
    <template #header>
      Import Data
    </template>
    <template #body>
      <div class="mb-2">
        <h2>This will overwrite all data currently on the page with what you paste below!</h2>
      </div>
      <div>
        <textarea rows="10" cols="50" v-model="importString"></textarea>
      </div>
      <button class="btn btn-primary" @click="pasteFromClipboard">Paste from Clipboard</button>
    </template>
    <template #footer>
      <button class="btn btn-danger" @click="showImportModal = false">Cancel</button>
      <button class="btn btn-success" @click="importData">Import Data</button>
    </template>
  </modal>

  <modal v-model="showNewFeaturesModal">
    <template #header>
      New Features
    </template>
    <template #body>
      <div>
        <h2>New Features</h2>
        <div>
          <h3>7/17/2024</h3>
          <ul>
            <li>Added a new feature to import and export data</li>
            <li>Added mobile support</li>
            <li>Added a new feature notification! (here it is!)</li>
          </ul>
        </div>
      </div>

      <div>
        <p>
          If you run into any issues or are missing a feature be sure to let me know here: <a
            href="https://github.com/GoodEffort/Arknights-Planner/issues">Github Issues</a>
        </p>
      </div>

      <div>
        <h2>Potential Features</h2>
        <div>
          <ul>
            <li>Optional Google Account sign in (for the feature below)</li>
            <li>Ability to save plans to your Google Drive so that you can use your plans between different devices and
              browsers</li>
          </ul>
        </div>
      </div>

      <div>
        <h2>Known Issues</h2>
        <div>
          <ul>
            <li>Amiya alternate forms aren't available</li>
            <li>EXP items are finicky, I plan to change these to calculate by EXP value rather than item count. For now
              if you are running into issues with it I'd reccommend just putting a ton of EXP items in each type in your
              inventory.</li>
          </ul>
        </div>
      </div>
      <div>
        <p>
          This is shown only once when new features are added, if you refresh after closing it (without the checkbox) it
          won't show until new features are added!
          If you would like to not see new features check the box below.
        </p>
        <input type="checkbox" class="formControl" v-model="doNotShowAgain" id="noshowagain" />
        <label for="noshowagain">Do not show this message again</label>
      </div>
    </template>
    <template #footer>
      <button class="btn btn-danger" @click="closeNewFeaturesModal">Close</button>
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

p {
  white-space: pre-line;
}

ul {
  list-style-type: none;
}

html.dark nav.navbar a.navbar-brand {
  color: rgb(231, 231, 231);
}
html.dark nav.navbar a.navbar-brand:hover {
  color: rgb(179, 179, 179);
}
</style>