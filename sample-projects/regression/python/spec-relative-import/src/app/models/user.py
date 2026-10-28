from ..core.base import Base
from . import helper


class User(Base):
    def assist(self):
        return helper.Helper()
