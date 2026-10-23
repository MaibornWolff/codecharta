import { formatDate } from '../../lib/util'

export function render(): string {
  return formatDate(new Date())
}
