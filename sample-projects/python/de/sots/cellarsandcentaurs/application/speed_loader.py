import importlib

speed_module = importlib.import_module("de.sots.cellarsandcentaurs.domain.model.speed")


class SpeedLoader:
    def load(self, feet_per_round: int):
        return speed_module.Speed(feet_per_round)
