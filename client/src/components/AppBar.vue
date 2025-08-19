<template>
  <div>
    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title class="cursorPointer" @click="changePath('/')">ILUVMICA CROCHET</v-toolbar-title>

      <v-spacer/>
      <p style="margin-right: 2%;">
        Hello, <span style="font-weight: bold; color:palevioletred;"> {{ usePersistStore.accountCredentials.username }}! </span>
      </p>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list v-for="(item,index) of filterNavItems(navItems,usePersistStore.accountCredentials.access_rights)" :index="index">
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
import { persistStore } from '@/stores/persistStore'

const router = useRouter()
const usePersistStore = persistStore()

const drawer = ref(false)
const navItems = ref([
    {
        title: 'Home',
        icon: 'mdi-home',
        path:'/'
    },
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
        title: 'About Us',
        icon: 'mdi-information',
        path:'/aboutus'
    },
    {
      title: 'Logout',
      icon: 'mdi-logout',
      path: 'logout'
    }
])

const userNavItems = ['Home','Logout','About Us']

const filterNavItems = (navItems,accessRights) => {
  console.log(accessRights,"accessRights");
  
  return navItems.filter((items) => {
    if(accessRights == 'User'){
      return userNavItems.includes(items.title)
    }
    else{
      return items
    }
  })
}

const changePath = (path) => {
  if(path == 'logout'){
    usePersistStore.clearLoginCredentials()
    router.push('/loginPage')
    return
  }

    router.push(path)
}

</script>
