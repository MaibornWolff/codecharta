import { Point } from './point'

export namespace Shapes {
  export class Circle {
    center?: Point
  }

  class Hidden {
    origin?: Point
  }

  export const unit = new Hidden()
}
