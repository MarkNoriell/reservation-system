import 'vuetify/styles'
import { createVuetify } from "vuetify"
import * as directives from 'vuetify/directives'
import * as components from 'vuetify/components'

export const registerPlugins = (app) => {
    app.use(createVuetify({
        directives,
        components
    }))
}