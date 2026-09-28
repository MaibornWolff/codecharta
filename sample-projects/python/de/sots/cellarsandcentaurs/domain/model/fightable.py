from abc import ABC, abstractmethod


class Fightable(ABC):
    @abstractmethod
    def attack_bonus(self) -> int:
        raise NotImplementedError
