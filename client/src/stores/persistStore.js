import { defineStore } from 'pinia'

export const persistStore = defineStore('store_local_storage', {
  state: () => ({
    accountCredentials: {
        username: '',
        password: ''
    }
  }),
  actions:{
    saveLoginCredentials({ username,password }){
        this.accountCredentials.username = username
        this.accountCredentials.password = password
    },
    clearLoginCredentials(){
        this.accountCredentials = {
            username: '',
            password: ''
        }
    }
  },
  persist: true
})
