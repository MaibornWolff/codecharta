USE_NATURAL_ARMOR = True

if USE_NATURAL_ARMOR:
    from de.sots.cellarsandcentaurs.domain.model.armor_class import ArmorClass


class Armory:
    def natural_armor(self, bonus: int) -> ArmorClass:
        return ArmorClass(10, bonus)
