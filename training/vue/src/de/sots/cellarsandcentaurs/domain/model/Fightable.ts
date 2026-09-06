export interface Fightable {
  attack(target: Fightable): void
  takeDamage(amount: number): void
}
