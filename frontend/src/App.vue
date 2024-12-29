<!-- src/App.vue -->
<template>
    <v-app>
      <v-main>
        <router-view />
      </v-main>
    </v-app>
  </template>
  
  <script>
  export default {
    name: 'App',
  }
  </script>
  
  <style>
  /* Ensure the app takes full height and has no unintended margins */
  html, body, #app {
    height: 100%;
    margin: 0;
  }
  </style>
  