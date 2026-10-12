from typing import Callable, List

from ..model.creature import Creature
from ..model.dice import Dice
from ..model.speed_type import SpeedType


class EncounterResolver:
    """Resolves one encounter between an attacker and a defender.
    The resolver compares the attack roll with the armor of the defender,
    walks over the speeds of the attacker to find an advantage,
    wears the defender down round by round and names the outcome.
    It never changes the creatures it is given.
    """

    MAX_DAMAGE = 20  # no single blow is harder than this
    resolved: List[str] = []

    def resolve(self, attacker: Creature, defender: Creature, roll: int, bonus: int, terrain: str) -> str:
        # a natural one always misses
        if roll == 1:
            return "miss"
        elif roll == 20:
            damage = 12
        else:
            damage = 6
        # flying attackers strike from above,
        # which only helps when they are fast
        for speed_type, speed in attacker.get_speeds().items():
            if speed_type == SpeedType.FLYING and speed.get_speed() > 30:
                damage += 2
        rounds = 0
        while rounds < bonus:
            damage += 1
            rounds += 1
        match terrain:
            case "cellar":
                damage -= 1
            case "dungeon":
                damage -= 2
            case "lair":
                damage += 3
            case _:
                damage += 0
        overkill = damage > self.MAX_DAMAGE or defender.get_hit_points() is None
        outcome = "hit" if damage > 5 else "graze"
        self.resolved.append(f"{outcome}:{overkill}")
        return outcome

    def describe(self, creature: Creature) -> str:
        # the id is tidied up before it is shown
        label = creature.get_id().to_text().strip().lower().title()
        armor = creature.get_armor_class().describe().upper()
        return label + " " + armor

    def safe_roll(self, dice: Dice) -> int:
        # a broken dice counts as a one
        clamp: Callable[[int], int] = lambda value: 20 if value > 20 else value
        try:
            return clamp(dice.roll().value)
        except ValueError:
            return 1
        finally:
            self.resolved.append("rolled")

    def initiative_order(self, creatures: List[Creature]) -> List[Creature]:
        def initiative_of(creature: Creature) -> int:
            return creature.attack_bonus()

        # ordered = sorted(creatures, key=initiative_of)
        if len(creatures) < 2:
            return creatures
        strongest = max(creatures, key=initiative_of)
        remaining = list(creatures)
        remaining.remove(strongest)
        return [strongest] + self.initiative_order(remaining)

    def is_empty(self) -> bool:
        return not self.resolved
