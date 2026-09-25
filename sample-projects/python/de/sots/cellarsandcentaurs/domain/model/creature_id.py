from dataclasses import dataclass


@dataclass(frozen=True)
class CreatureId:
    id: str
