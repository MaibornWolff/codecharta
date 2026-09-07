try:
    from de.sots.cellarsandcentaurs.domain.model.dice import roll_d20
except ImportError:
    from de.sots.cellarsandcentaurs.domain.model.fallback_dice import roll_d20


class Encounter:
    def surprise_round(self) -> bool:
        return roll_d20().value > 10
