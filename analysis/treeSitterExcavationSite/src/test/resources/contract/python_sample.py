"""
A comprehensive sample module demonstrating various Python features.
Used for golden file contract testing.
"""

from enum import Enum
from typing import List, Optional


# Enum for testing enum extraction
class Status(Enum):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"


# Decorator for testing
def logged(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper


class Sample:
    """A sample class with various method types."""

    # Class-level constant
    MAX_RETRIES = 3

    def __init__(self, prefix: str = "Hello, "):
        self.prefix = prefix
        self._counter = 0

    def get_counter(self) -> int:
        """Simple getter with no complexity."""
        return self._counter

    # Calculate sum with validation and control flow
    def calculate(self, a: int, b: int, c: int, d: int, e: int) -> int:
        if a < 0 or b < 0:
            return 0
        total = 0
        for i in range(c):
            total += a + b
        while d > 0:
            total += d
            d -= 1
        return total + e

    """
    A long method that processes data with nested logic.
    This tests long_method detection (15+ lines).
    """
    def process_data(self, items: List[str]) -> str:
        result = []
        count = 0
        for item in items:
            if item is None:
                continue
            if len(item) == 0:
                result.append("empty")
            elif len(item) > 10:
                for i in range(3):
                    result.append(item[:5])
            else:
                result.append(item)
            count += 1
        try:
            result.append(f" total: {count}")
        except Exception:
            return "error"
        return "".join(result)

    # Method chaining example (triggers message_chains metric)
    def chained_call(self, input_str: Optional[str]) -> Optional[str]:
        if input_str is None:
            return None
        return input_str.strip().upper().replace("A", "X").replace("B", "Y")

    @logged
    def format_by_type(self, type_id: int) -> str:
        """
        Demonstrates match expression usage.

        Args:
            type_id: the type identifier

        Returns:
            formatted result string
        """
        match type_id:
            case 1:
                label = "one"
            case 2:
                label = "two"
            case 3:
                label = "three"
            case _:
                label = "unknown"
        return f"{self.prefix}{label}"

    # List comprehension example
    def filter_items(self, items: List[str]) -> List[str]:
        return [item for item in items if len(item) > 3]

    # Class method example
    @classmethod
    def create_default(cls) -> "Sample":
        return cls("Default: ")

    # Static method example
    @staticmethod
    def validate(value: int) -> bool:
        return value >= 0
