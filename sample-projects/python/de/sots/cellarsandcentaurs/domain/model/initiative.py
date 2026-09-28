from . import creature


class Initiative:
    def __init__(self, combatant: creature.Creature, bonus: int):
        self.combatant = combatant
        self.bonus = bonus

    def acts_before(self, other: "Initiative") -> bool:
        return self.bonus + self.combatant.attack_bonus() > other.bonus + other.combatant.attack_bonus()
