<script setup lang="ts">
import NightModeToggle from './NightModeToggle.vue';
</script>

<template>
  <nav class="navbar navbar-expand-lg fixed-top">
    <div>
      <night-mode-toggle />
    </div>
  </nav>
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

nav.navbar li.nav-item.active > a > span {
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

html.dark nav.navbar {
  background-color: #000000;
  border-bottom: 1px solid #5f5f5f;
}
</style>