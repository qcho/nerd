from werkzeug.security import check_password_hash, generate_password_hash

from user_storage import User, UserStorage


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

    def check_login(self, email: str, password: str):
        user = self.get(email)
        if user is None:
            return False
        return check_password_hash(user.password, password)

    def get(self, email: str):
        return self.user_storage.find_with_email(email)
