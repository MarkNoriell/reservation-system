import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { registerPlugins } from './plugins'

const app = createApp(App)

app.use(createPinia())
app.use(registerPlugins(app))
app.use(router)

app.mount('#app')
