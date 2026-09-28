export class Speed {
  constructor(private speed: number) {}

  getSpeed(): number {
    return this.speed
  }

  setSpeed(speed: number): void {
    this.speed = speed
  }
}
