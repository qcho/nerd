from user_storage import UserStorage

class UserManager:

    def __init__(self, user_storage: UserStorage):
        self.user_storage = user_storage
