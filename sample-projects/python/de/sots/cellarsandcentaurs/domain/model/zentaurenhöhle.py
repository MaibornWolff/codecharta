from dataclasses import dataclass

from .armor_class import ArmorClass


@dataclass
class Zentaurenhöhle:
    # Die Zentaurenhöhle liegt unter dem Verlies. Rüstungsklasse und Trefferpunkte gehören zu jeder Kreatur.
    rüstungsklasse: ArmorClass

    def describe_size(self) -> str:
        return "Größe der Höhle"
