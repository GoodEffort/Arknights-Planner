<script setup lang="ts">
import NewFeatures from '@/components/modals/NewFeaturesModal.vue';
import NightModeToggle from '@/components/generic/NightModeToggle.vue';
import { ref } from 'vue';
import { usePlannerStore } from '@/store/planner-store';
import GoogleButton from '@/components/google/GoogleButton.vue';
import SettingsModal from '@/components/modals/SettingsModal.vue';
import CreditsModal from '@/components/modals/CreditsModal.vue';
import ImportExportModal from '@/components/modals/ImportExportModal.vue';
import EventGainsModal from './modals/EventGainsModal.vue';
import { storeToRefs } from 'pinia';

const { googleDriveTest } = storeToRefs(usePlannerStore());

const lastUse = new Date(localStorage.getItem('last-use-timestamp') ?? 0);

const showCreditsmodal = ref(false);
const showImportExportModal = ref(false);
const showNewFeaturesModal = ref(lastUse < new Date(BUILD_DATE)); // can use BUILD_DATE but if I push a quick bug fix, I don't want to show it again
const showSideMenu = ref(false);
const showSettings = ref(false);
const showEventGainsModal = ref(false);

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
        <button class="btn btn-primary" @click="showImportExportModal = !showImportExportModal">
          <font-awesome-icon icon="upload" />
          <span class="d-none d-md-inline"> Import / Export</span>
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
            <GoogleButton />
          </div>
        </div>
        <div class="list-group-item separator"></div>
        <div class="list-group-item" @click="showImportExportModal = !showImportExportModal">
          <div><font-awesome-icon icon="upload" /> Import / Export</div>
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
        <div class="list-group-item separator"></div>
        <div class="list-group-item" @click="showEventGainsModal = true">
          <div><font-awesome-icon icon="calculator" /> Event Gains</div>
        </div>
      </div>
    </div>
  </Transition>

  <SettingsModal v-model="showSettings" />

  <CreditsModal v-model="showCreditsmodal" />

  <ImportExportModal v-model="showImportExportModal" />

  <NewFeatures v-model="showNewFeaturesModal" />

  <EventGainsModal v-model="showEventGainsModal" />
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