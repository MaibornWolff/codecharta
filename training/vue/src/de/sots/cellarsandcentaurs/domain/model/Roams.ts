export function Roams(terrain: string): ClassDecorator {
  return (target) => {
    Reflect.defineProperty(target, 'terrain', { value: terrain })
  }
}
