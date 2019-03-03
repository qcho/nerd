from user_storage import User, UserStorage
from typing import List
from werkzeug.security import check_password_hash, generate_password_hash


class EmailAlreadyRegisteredException(Exception):
    pass


class UserManager:

    def __init__(self, user_storage: UserStorage):
        self.user_storage = user_storage

    def register(self, name: str, email: str, password: str):
        if self.user_storage.find_with_email(email):
            raise EmailAlreadyRegisteredException()

        user = User(name, email, generate_password_hash(password), ["user"])
        self.user_storage.save(user)
        return user

    def update(self, user: User, password: str = None):
        if password:
            user.password = generate_password_hash(password)
        self.user_storage.save(user)


    def all(self) -> List[User]:
        """Returns a list of all registered users"""
        return self.user_storage.all()

    def check_login(self, email: str, password: str):
        user = self.get(email)
        if user is None:
            return False
        return check_password_hash(user.password, password)

    def get(self, email: str):
        return self.user_storage.find_with_email(email)
