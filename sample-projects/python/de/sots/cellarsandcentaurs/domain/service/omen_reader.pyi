from typing import overload

from ..model.creature import Creature
from ..model.dice import DiceRoll

class OmenReader:
    """Reads the omen of an encounter; the implementation is a compiled module."""

    portents: int
    @overload
    def read_omen(self, creature: Creature) -> str: ...
    @overload
    def read_omen(self, creature: Creature, roll: DiceRoll = ...) -> str: ...
    def is_ominous(self, roll: DiceRoll) -> bool: ...
