<script setup>
import AppBar from './components/AppBar.vue'
</script>

<template>
  <div>
    <v-app class="body">
      <!-- <AppBar/> -->
      
      <v-main>
        <RouterView/>
      </v-main>

    </v-app>
  </div>
</template>