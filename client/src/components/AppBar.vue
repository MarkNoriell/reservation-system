<template>
  <div>
    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title class="cursorPointer" @click="changePath('/')">ILUVMICA CROCHET</v-toolbar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list v-for="(item,index) of navItems" :index="index">
        <v-list-item @click="changePath(item.path)">
            <div class="cursorPointer" style="display: flex; gap:10px;">
                 <v-icon>{{ item.icon }}</v-icon>{{ item.title }}
             </div>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()

const drawer = ref(false)
const navItems = ref([
    {
        title: 'Dashboard',
        icon: 'mdi-monitor-dashboard',
        path:'/dashboard'
    },
    {
        title: 'Reservations',
        icon: 'mdi-calendar-clock',
        path:'/reservation'
    },
    {
        title: 'Inventory',
        icon: 'mdi-treasure-chest-outline',
        path:'/inventory'
    },
    {
        title: 'Sales',
        icon: 'mdi-finance',
        path:'/sales'
    },
    {
        title: 'Accounts',
        icon: 'mdi-account',
        path:'/accounts'
    },
    {
      title: 'Logout',
      icon: 'mdi-logout',
      path: 'logout'
    }
])

const changePath = (path) => {
  if(path == 'logout'){
    router.push('/loginPage')
    return
  }

    router.push(path)
}

</script>
