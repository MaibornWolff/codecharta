// Die Zentaurenhöhle liegt unter dem Verlies. Rüstungsklasse und Trefferpunkte gehören zu jeder Kreatur.
export const beschriftung = 'Größe der Höhle'

export class Zentaurenhöhle {
  constructor(readonly rüstungsklasse: number) {}

  istGepanzert(): boolean {
    return this.rüstungsklasse > 10
  }
}
