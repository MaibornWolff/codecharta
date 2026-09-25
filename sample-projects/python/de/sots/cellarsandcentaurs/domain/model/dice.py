import random
from dataclasses import dataclass


@dataclass(frozen=True)
class Dice:
    sides: int

    def roll(self) -> "DiceRoll":
        return DiceRoll(self, random.randint(1, self.sides))


@dataclass(frozen=True)
class DiceRoll:
    dice: Dice
    value: int


def roll_d20() -> DiceRoll:
    d20Roll = Dice(20).roll()
    return d20Roll
