import { defineAsyncComponent } from 'vue'

export const LazyForm = defineAsyncComponent({ loader: () => import('./components/Form.vue') })
