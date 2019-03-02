import abc
import json
from pathlib import Path
from typing import List
from user import User


class UserStorage(abc.ABC):

    @abc.abstractmethod
    def find_with_email(self, email: str) -> User:
        pass

    def all(self) -> List[User]:
        pass

    @abc.abstractmethod
    def save(self, user: User):
        pass


class FileUserStorage(UserStorage):

    def __init__(self, user_file_path: Path):
        self._user_data = {}
        self._file_path = user_file_path
        if not user_file_path.exists():
            self.persist()
        self.load_from_disk()

    def all(self) -> List[User]:
        return [User.from_json(u) for u in self._user_data.values()]

    def find_with_email(self, email: str) -> User:
        if email in self._user_data:
            return User.from_json(self._user_data[email])
        return None

    def save(self, user: User):
        self._user_data[user.email] = user.to_json()
        self.persist()

    def load_from_disk(self):
        with open(self._file_path, 'r', encoding='utf8') as inf:
            self._user_data = json.load(inf)

    def persist(self):
        with open(self._file_path, 'w', encoding='utf8') as outf:
            json.dump(self._user_data, outf)
