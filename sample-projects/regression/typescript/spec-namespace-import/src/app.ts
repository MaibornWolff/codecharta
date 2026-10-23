import * as models from './models/user'

export class App {
  user?: models.User

  make(): unknown {
    return models.create()
  }
}

export function all(): unknown {
  return models
}
