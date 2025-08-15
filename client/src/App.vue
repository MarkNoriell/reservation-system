<script setup>
  import AppBar from './components/AppBar.vue'
  import { persistStore } from './stores/persistStore';

  const usePersistStore = persistStore()

  const isAccountCredentialsNotEmpty = ({ username }) => {
    return username != ''
  }


</script>

<template>
  <div>
    <v-app class="body">
      <AppBar v-if="isAccountCredentialsNotEmpty(usePersistStore.accountCredentials)"/>
      
      <v-main>
        <RouterView/>
      </v-main>

    </v-app>
  </div>
</template>