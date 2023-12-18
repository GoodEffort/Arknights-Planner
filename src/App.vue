<script setup lang="ts">
import Planner from "./components/Planner.vue"
import Navbar from "./components/Navbar.vue"
</script>

<template>
  <div>
    <Navbar />
  </div>
  <!-- yeah, this is supposed to be hidden, was being lazy -->
  <nav>Planner</nav>
  <Planner />
</template>

<style scoped>
body {
  background-color: #f5f5f5;
}
</style>
