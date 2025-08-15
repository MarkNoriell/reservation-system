import { defineStore } from 'pinia'

export const persistStore = defineStore('store_local_storage', {
  state: () => ({
    accountCredentials: {
        username: '',
        password: '',
        access_rights:''
    }
  }),
  actions:{
    saveLoginCredentials({ username,password, access_rights }){
        this.accountCredentials.username = username
        this.accountCredentials.password = password
        this.accountCredentials.access_rights = access_rights
    },
    clearLoginCredentials(){
        this.accountCredentials = {
            username: '',
            password: '',
            access_rights: ''
        }
    }
  },
  persist: true
})
