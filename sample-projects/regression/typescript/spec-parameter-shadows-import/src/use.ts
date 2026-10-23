import { Model } from './model'

export function shadowed(Model: number): number {
  return Model
}

export function plain(): Model {
  return new Model()
}
