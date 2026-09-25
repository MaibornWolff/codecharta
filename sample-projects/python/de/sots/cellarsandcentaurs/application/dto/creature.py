from dataclasses import dataclass


@dataclass(frozen=True)
class Creature:
    id: str
    type: str
    hit_points: int
