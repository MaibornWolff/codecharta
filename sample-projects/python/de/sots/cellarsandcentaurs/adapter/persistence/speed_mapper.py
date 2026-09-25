import de.sots.cellarsandcentaurs.domain.model.speed as speed_module


class SpeedMapper:
    def to_domain(self, stored_speed: int):
        return speed_module.Speed(stored_speed)

    def to_entity(self, speed) -> int:
        return speed.get_speed()
