from app.models.user import User


class Service:
    def find(self) -> User:
        return User()
