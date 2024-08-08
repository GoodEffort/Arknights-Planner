<script setup lang="ts">
import NewFeatures from './NewFeatures.vue';
import NightModeToggle from './NightModeToggle.vue';
import ArkPRTSImportModal from './ArkPRTSImportModal.vue';
import { ref } from 'vue';
import { usePlannerStore } from '../store/planner-store';
import GoogleDriveAPI from './GoogleDriveAPI.vue';
import SettingsModal from './SettingsModal.vue';
import CreditsModal from './CreditsModal.vue';
import ExportModal from './ExportModal.vue';
import ImportModal from './ImportModal.vue';
import { storeToRefs } from 'pinia';

const { googleDriveTest } = storeToRefs(usePlannerStore());

const lastUse = new Date(localStorage.getItem('last-use-timestamp') ?? 0);

const showCreditsmodal = ref(false);
const showExportModal = ref(false);
const showImportModal = ref(false);
const showNewFeaturesModal = ref(lastUse < new Date('8/7/2024')); // can use BUILD_DATE but if I push a quick bug fix, I don't want to show it again
const showSideMenu = ref(false);
const showSettings = ref(false);
const showArkPRTSImportModal = ref(false);

const openUpcomingEvents = () => {
  window.open('https://arknights.wiki.gg/wiki/Event', '_blank');
};
</script>

<template>
  <nav class="navbar navbar-expand-lg fixed-top">
    <div class="side-menu-button" @click="showSideMenu = !showSideMenu">
      <div>
        <a class="navbar-brand"><font-awesome-icon icon="bars" /> Arknights Planner</a>
      </div>
    </div>
    <div>
      <div class="btn-group" role="group">
        <button class="btn btn-primary" @click="showExportModal = !showExportModal">
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
      </div>
    </div>
  </nav>

  <Transition>
    <div class="side-menu" v-show="showSideMenu" @click.self="showSideMenu = false">
      <div class="list-group">
        <div class="list-group-item no-hover" v-if="googleDriveTest">
          <div class="google-login">
            <GoogleDriveAPI />
          </div>
        </div>
        <div class="list-group-item separator"></div>
        <div class="list-group-item" @click="showExportModal = !showExportModal">
          <div><font-awesome-icon icon="download" /> Export</div>
        </div>
        <div class="list-group-item" @click="showImportModal = !showImportModal">
          <div><font-awesome-icon icon="upload" /> Import</div>
        </div>
        <div class="list-group-item" @click="showArkPRTSImportModal = !showArkPRTSImportModal">
          <div><font-awesome-icon icon="upload" /> Import from ArkPRTS</div>
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
        <div class="list-group-item separator"></div>
        <div class="list-group-item" @click="showSettings = true">
          <div><font-awesome-icon icon="gear" /> Settings</div>
        </div>
      </div>
    </div>
  </Transition>

  <SettingsModal v-model="showSettings" />

  <CreditsModal v-model="showCreditsmodal" />

  <ExportModal v-model="showExportModal" />

  <ImportModal v-model="showImportModal" />

  <NewFeatures v-model="showNewFeaturesModal" />

  <ArkPRTSImportModal v-model="showArkPRTSImportModal" />
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