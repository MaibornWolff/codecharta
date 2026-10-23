import { format, size } from './fmt'

export const card = {
  methods: { format },
  data() {
    const { label } = { label: 'card' }
    return { size, label }
  }
}
