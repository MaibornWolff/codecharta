import { Model } from './model'

export function local(): unknown {
  class Model {}
  return new Model()
}

export function outer(): Model {
  return new Model()
}
