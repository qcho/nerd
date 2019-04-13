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

    def update(data):
        if "email" in data:
            self.email = data["email"]
        if "name" in data:
            self.name = data["name"]
        if "roles" in data:
            self.roles = data["roles"]

    def to_json(self):
        return {
            'name': self.name,
            'email': self.email,
            'password': self.password,
            'roles': self.roles
        }

    def __str__(self):
        rank = '⭐️ ' if 'admin' in self.roles else ''
        return '{0} <{1}>'.format(self.name, self.email, rank)
