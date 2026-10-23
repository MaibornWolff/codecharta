export function preload(): Promise<unknown> {
  return import('./heavy')
}
