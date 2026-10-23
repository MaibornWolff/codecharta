import load from './anon'
import config from './config'

export function start(): number {
  return load() + config.port
}
