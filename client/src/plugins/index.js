import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from "vuetify"
import * as directives from 'vuetify/directives'
import * as components from 'vuetify/components'

export const registerPlugins = (app) => {
    app.use(createVuetify({
        directives,
        components,
        icons: {
            defaultSet: 'mdi', // ✅ Correct way to set default icon set
        },
    }))
}