function helper(): number {
  return 1
}

export class Api {
  get(): number {
    return helper()
  }
}
