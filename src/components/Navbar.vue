<script setup lang="ts">
import Modal from './Modal.vue';
import NewFeatures from './NewFeatures.vue';
import NightModeToggle from './NightModeToggle.vue';
import { ref } from 'vue';
import { usePlannerStore } from '../store/planner-store';
import GoogleDriveAPI from './GoogleDriveAPI.vue';

const store = usePlannerStore();
const { exportSavedRecords, importSavedRecords } = store;

const lastUse = new Date(localStorage.getItem('last-use-timestamp') ?? 0);

const showCreditsmodal = ref(false);
const showExportModal = ref(false);
const showImportModal = ref(false);
const importString = ref('');
const showNewFeaturesModal = ref(lastUse < new Date(BUILD_DATE));
const exportString = ref('');
const showSideMenu = ref(false);

const importData = () => {
  if (importString.value) {
    importSavedRecords(importString.value);
    showImportModal.value = false;
    importString.value = '';
  }
  else {
    alert('No data to import');
  }
}

const exportData = () => {
  exportString.value = JSON.stringify(exportSavedRecords());
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

const openUpcomingEvents = () => {
  window.open('https://arknights.wiki.gg/wiki/Event', '_blank');
};
</script>

<template>
  <nav class="navbar navbar-expand-lg fixed-top">
    <div class="side-menu-button" @click="showSideMenu = !showSideMenu">
      <div>
        <a class="navbar-brand" href="#"><font-awesome-icon icon="bars" /> Arknights Planner</a>
      </div>
    </div>
  </nav>

  <Transition>
    <div class="side-menu" v-show="showSideMenu" @click.self="showSideMenu = false">
      <div class="list-group">
        <div class="list-group-item no-hover">
          <div class="google-login">
            <GoogleDriveAPI />
          </div>
        </div>
        <div class="list-group-item separator"></div>
        <div class="list-group-item" @click="exportData">
          <div><font-awesome-icon icon="download" /> Export</div>
        </div>
        <div class="list-group-item" @click="showImportModal = !showImportModal">
          <div><font-awesome-icon icon="upload" /> Import</div>
        </div>
        <div class="list-group-item separator"></div>
        <div class="list-group-item" @click="showCreditsmodal = !showCreditsmodal">
          <div><font-awesome-icon icon="info-circle" /> Credits</div>
        </div>
        <div class="list-group-item" @click="showNewFeaturesModal = true">
          <div><font-awesome-icon icon="lightbulb" /> New Features</div>
        </div>
        <div class="list-group-item separator"></div>
        <div class="list-group-item" @click="openUpcomingEvents">
          <div><font-awesome-icon icon="calendar-day" /> Upcoming Events</div>
        </div>
        <div class="list-group-item separator"></div>
        <night-mode-toggle />
      </div>
    </div>
  </Transition>

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

  <NewFeatures v-model="showNewFeaturesModal" />
</template>

<style scoped>
a:link {
  text-decoration: none;
}

nav.navbar {
  justify-content: space-between;
  padding-left: 1em;
  padding-right: 1em;
  -webkit-user-select: none;
  /* Safari */
  -ms-user-select: none;
  /* IE 10 and IE 11 */
  user-select: none;
  /* Standard syntax */
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

html.dark nav.navbar a.navbar-brand {
  color: rgb(231, 231, 231);
}

html.dark nav.navbar a.navbar-brand:hover {
  color: rgb(179, 179, 179);
}

.google-login {
  display: inline-block;
  vertical-align: middle;
}

.side-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.side-menu .list-group {
  position: fixed;
  padding-top: 0.5rem;
  overflow-x: hidden;
  top: 60px;
  left: 0;
  width: 250px;
  height: 100%;
  background-color: white;
  z-index: 1001;
}

.side-menu .list-group-item {
  border-right: 0px;
  border-left: 0px;
  border-top: 0px;
  border-radius: 0px;
  margin-left: 5px;
  margin-right: 5px;
  /* Safari */
  -ms-user-select: none;
  /* IE 10 and IE 11 */
  user-select: none;
  /* Standard syntax */
  cursor: pointer;
  /* don't allow click through */
  pointer-events: auto;
}

.side-menu .list-group-item.separator {
  cursor: default;
}

html.dark .side-menu .list-group {
  background-color: rgb(31, 31, 31);
}

html.dark .side-menu .list-group-item {
  color: rgb(231, 231, 231);
  background-color: rgb(31, 31, 31);
  border-color: rgb(71, 71, 71);
}

html.dark .side-menu .list-group-item:hover {
  background-color: rgb(0, 0, 0);
}

html.dark .side-menu .list-group-item.no-hover:hover,
html.dark .side-menu .list-group-item.separator:hover {
  background-color: inherit;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.side-menu-button {
  cursor: pointer;
}
</style>