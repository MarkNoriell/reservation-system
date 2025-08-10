<script setup>
  import AppBar from './components/AppBar.vue'
</script>

<template>
  <div>
    <v-app class="body">
      <AppBar v-if="urlPath != '/loginPage'"/>
      
      <v-main>
        <RouterView/>
      </v-main>

    </v-app>
  </div>
</template>