import { createApp } from 'vue'
import App from './App.vue'
import CreatureBadge from './de/sots/cellarsandcentaurs/ui/CreatureBadge.vue'

const app = createApp(App)
app.component('CreatureBadge', CreatureBadge)
app.mount('#app')
