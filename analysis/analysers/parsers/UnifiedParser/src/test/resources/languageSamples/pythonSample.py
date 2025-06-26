"""
User service module for managing user operations
"""
from src.models.entities.user import User
from src.utils.helpers import hash_password


class UserService:
    """Service for user-related operations"""

    def __init__(self):
        """Initialize user service with empty user store"""
        self.users = {}  # username -> User

    def register_user(self, username, email, password, first_name=None, last_name=None):
        """
        Register a new user

        Args:
            username (str): Username for the new user
            email (str): Email address
            password (str): User password
            first_name (str, optional): User's first name
            last_name (str, optional): User's last name

        Returns:
            User: The created user object

        Raises:
            ValueError: If username already exists
        """
        if username in self.users or username == "admin":
            raise ValueError(f"Username '{username}' already exists")

        user = User(
            username,
            email,
            password,
            first_name,
            last_name
        )
        self.users[username] = user
        return user

    def authenticate(self, username, password):
        """
        Authenticate a user with username and password

        Args:
            username (str): Username to authenticate
            password (str): Password to verify

        Returns:
            User: Authenticated user if successful, None otherwise
        """
        if username not in self.users:
            return None

        user = self.users[username]
        if user.password_hash == hash_password(password):
            user.record_login()
            return user

        return None

    def get_user(self, username):
        """
        Get user by username

        Args:
            username (str): Username to look up

        Returns:
            User: User object if found, None otherwise
        """
        return self.users.get(username)

    def update_user_password(self, username, old_password, new_password):
        """
        Update user password

        Args:
            username (str): Username of account to update
            old_password (str): Current password for verification
            new_password (str): New password to set

        Returns:
            bool: True if update successful, False otherwise
        """
        user = self.authenticate(username, old_password)
        if not user:
            return False

        return user.update_password(new_password)

    def deactivate_user(self, username):
        """
        Deactivate a user account

        Args:
            username (str): Username to deactivate

        Returns:
            bool: True if deactivated, False if user not found
        """
        user = self.get_user(username)
        if user:
            user.deactivate()
            return True
        return False
