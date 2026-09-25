from de.sots.cellarsandcentaurs.application.creature_util import CreatureUtil


class ArmorClass:
    def __init__(self, base: int, bonus: int, description: str = CreatureUtil.STANDARD_ARMOR_CLASS_DESCRIPTION):
        self.description = description
        self.base = base
        self.bonus = bonus

    @property
    def total(self) -> int:
        return self.base + self.bonus
