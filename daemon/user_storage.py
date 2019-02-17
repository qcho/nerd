import abc
import json
from pathlib import Path


class User():
    @staticmethod
    def from_json(data):
        pass

    def to_json(self):
        pass


class UserStorage(abc.ABC):

    @abc.abstractmethod
    def find_with_username(self, username: str) -> User:
        pass

    @abc.abstractmethod
    def save(self, user: User):
        pass


class FileUserStorage(UserStorage):

    def __init__(self, user_file_path: Path):
        if not user_file_path.exists():
            with open(user_file_path, 'w', encoding='utf8') as outf:
                json.dump({}, outf)
        with open(user_file_path, 'r', encoding='utf8') as inf:
            self._user_data = json.load(inf)

    def find_with_username(self, username: str) -> User:
        if username in self._user_data:
            return User.from_json(self._user_data[username])
        return None

    def save(self, user: User):
        pass
