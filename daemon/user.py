from typing import List

class User():

    def __init__(self, name: str, email: str, password: str, roles: List[str]):
        self.name = name
        self.email = email
        self.password = password
        self.roles = roles

    @staticmethod
    def from_json(data):
        return User(data['name'], data['email'], data['password'], data['roles'])

    def to_json(self):
        return {
            'name': self.name,
            'email': self.email,
            'password': self.password,
            'roles': self.roles
        }
