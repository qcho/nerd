from enum import Enum

import mongoengine as me
from mongoengine import signals
from werkzeug.security import generate_password_hash, check_password_hash


class Role(Enum):
    ADMIN = 'admin'
    USER = 'user'


class User(me.Document):
    email = me.EmailField(primary_key=True)
    name = me.StringField(required=True)
    password = me.StringField(required=True)
    roles = me.ListField(me.StringField(), required=True)
    plain_password = me.StringField(default=None)

    @classmethod
    def pre_save(cls, sender, document, **kwargs):
        if document.plain_password is not None:
            document.password = generate_password_hash(document.plain_password)
            document.plain_password = None

    def password_matches(self, plain_password):
        return check_password_hash(self.password, plain_password)


signals.pre_save.connect(User.pre_save, sender=User)
