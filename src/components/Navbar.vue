<script setup lang="ts">
import Modal from './Modal.vue';
import NightModeToggle from './NightModeToggle.vue';
import { ref } from 'vue';

const showModal = ref(false);
</script>

<template>
  <nav class="navbar navbar-expand-lg fixed-top">
    <div>
      <night-mode-toggle />
    </div>
    <div>
      <font-awesome-icon icon="info-circle" @click="showModal = !showModal" />
    </div>
  </nav>
  <modal v-if="showModal" @close="showModal = false">
    <template #header>
      Data Source Credits
    </template>
    <template #body>
      <div>
        <div>(Currently using)</div>
        <div>- https://github.com/Kengxxiao/ArknightsGameData_YoStar</div>
        <div>- https://github.com/Aceship/Arknight-Images</div>
        <div>(Planned)</div>
        <div>- https://github.com/Kengxxiao/ArknightsGameData</div>
        <div>- https://docs.google.com/spreadsheets/d/12X0uBQaN7MuuMWWDTiUjIni_MOP015GnulggmBJgBaQ/</div>
      </div>
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