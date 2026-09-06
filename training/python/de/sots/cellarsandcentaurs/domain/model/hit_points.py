from dataclasses import dataclass

MAX_HIT_POINTS = 200


@dataclass(frozen=True)
class HitPoints:
    """Hit points drop when the creature takes damage and recover when it rests in its lair."""

    current: int
    max: int
    temporary: int = 0

    @classmethod
    def init(cls, max_value: int) -> "HitPoints":
        return cls(min(max_value, MAX_HIT_POINTS), min(max_value, MAX_HIT_POINTS), 0)

    def take_damage(self, damage: int) -> "HitPoints":
        return HitPoints(max(self.current - damage, 0), self.max, self.temporary)
