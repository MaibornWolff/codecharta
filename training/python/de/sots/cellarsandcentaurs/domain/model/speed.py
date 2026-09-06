from dataclasses import dataclass


@dataclass
class Speed:
    speed: int

    def get_speed(self) -> int:
        return self.speed

    def set_speed(self, speed: int) -> None:
        self.speed = speed
