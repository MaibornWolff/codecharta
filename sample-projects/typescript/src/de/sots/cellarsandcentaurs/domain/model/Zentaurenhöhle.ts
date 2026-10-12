import { ArmorClass } from "./ArmorClass";

// Die Zentaurenhöhle liegt unter dem Verlies. Rüstungsklasse und Trefferpunkte gehören zu jeder Kreatur.
export class Zentaurenhöhle {
    private rüstungsklasse?: ArmorClass;
    readonly beschreibung = "Größe der Höhle";

    setzeRüstungsklasse(rüstungsklasse: ArmorClass): void {
        this.rüstungsklasse = rüstungsklasse;
    }

    größe(): number {
        return this.rüstungsklasse === undefined ? 0 : this.rüstungsklasse.getTotal();
    }
}
