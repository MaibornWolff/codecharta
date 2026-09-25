import typing

from de.sots.cellarsandcentaurs.domain.model.centaur import Centaur


class Stable:
    def __init__(self):
        self.stalls: typing.List["Centaur"] = []

    def residents(self) -> typing.List["Centaur"]:
        return list(self.stalls)
