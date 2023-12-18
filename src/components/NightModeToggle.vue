<script setup lang="ts">
import { ref, onMounted } from 'vue';
export type UserTheme = 'light' | 'dark';

const userTheme = ref<UserTheme>(getTheme());

function setTheme(theme: UserTheme): void {
  userTheme.value = theme;
  localStorage.setItem('theme', theme);
  document.documentElement.className = theme;
}

function getTheme(): UserTheme {
    let theme = localStorage.getItem('theme') as UserTheme | null;

    if (theme === null) {
        // pulls the users perferred theme from their OS, didn't know I could do that
        // https://stackoverflow.com/questions/50730640/how-can-i-detect-if-dark-mode-is-enabled-on-my-website
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    return theme;
};

function toggleTheme(): void {
    if (userTheme.value === 'dark') {
        setTheme('light');
    } else {
        setTheme('dark');
    }
}

onMounted(() => {
    setTheme(getTheme());
});
</script>

<template>
    <button class="btn btn-primary" @click="toggleTheme">
        <font-awesome-icon v-if="userTheme === 'dark'" icon="moon" />
        <font-awesome-icon v-else icon="sun" />
    </button>
</template>