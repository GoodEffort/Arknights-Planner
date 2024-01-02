<script setup lang="ts">
import Planner from "./components/Planner.vue"
import Navbar from "./components/Navbar.vue"
</script>

<template>
  <Navbar />
  <!-- yeah, this is supposed to be hidden, was being lazy -->
  <nav>Planner</nav>
  <Planner />
</template>
