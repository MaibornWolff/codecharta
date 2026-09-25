from abc import ABC, abstractmethod
from typing import Dict, Generic, List, Optional, TypeVar

T = TypeVar("T")


class Repository(ABC, Generic[T]):
    def __init__(self):
        self._items: Dict[str, T] = {}

    @abstractmethod
    def key_of(self, item: T) -> str:
        raise NotImplementedError

    def save(self, item: T) -> None:
        self._items[self.key_of(item)] = item

    def find_one(self, key: str) -> Optional[T]:
        return self._items.get(key)

    def find_all(self) -> List[T]:
        return list(self._items.values())
