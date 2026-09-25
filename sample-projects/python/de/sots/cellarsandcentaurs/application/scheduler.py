from de.sots.cellarsandcentaurs.infrastructure.clock import Clock


class Scheduler:
    def __init__(self, clock: Clock):
        self.clock = clock

    def next_encounter_at(self, delay_seconds: float) -> float:
        return self.clock.now() + delay_seconds
