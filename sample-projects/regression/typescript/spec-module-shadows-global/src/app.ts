import { Registry } from './registry'

export function info(registry: Registry): number {
  return registry.size
}
