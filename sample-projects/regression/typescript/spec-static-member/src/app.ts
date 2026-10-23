import { Color, Config } from './config'

export function start(): unknown {
  Config.load()
  return Color.Red
}
