import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createPinia } from 'pinia'
import { createVuetify } from "vuetify"
import * as directives from 'vuetify/directives'
import * as components from 'vuetify/components'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'

const preServeTheme = {
    dark: false,
    colors: {
    background: '#FFFBF9', // Light cream background
    surface: '#FFFFFF',
    primary: '#FADCD9',    // Soft pink
    'primary-darken-1': '#F8C8C0',
    secondary: '#F9E2D2',
    'secondary-darken-1': '#F6D5BC',
    error: '#B00020',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
    text: '#5D4037' // Brownish text color
    }
}

export const registerPlugins = (app) => {
    const pinia = createPinia()
    pinia.use(piniaPluginPersistedState)

    app.use(pinia)
    app.use(createVuetify({
        directives,
        components,
        icons: {
            defaultSet: 'mdi', // ✅ Correct way to set default icon set
        },
        theme: {
            defaultTheme: 'preServeTheme',
            themes: {
                preServeTheme,
            },
        },
    }))
}