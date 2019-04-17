from datetime import datetime

from core.document.version import Version
from core.document.user import User


class NERdSetup:
    @staticmethod
    def setup(drop: bool):
        if drop:
            User.drop_collection()
        User(
            name='Admin',
            email='admin@example.com',
            plain_password='1',
            roles=['user', 'admin']
        ).save()

        if drop:
            Version.drop_collection()
        Version(
            name='Spanish (medium)',
            created_at=datetime.now(),
            types={}
        ).save()



    @staticmethod
    def dev_setup(drop: bool):
        from faker import Faker
        from faker.providers import internet

        fake = Faker()
        fake.add_provider(internet)

        NERdSetup.setup(drop)

        for i in range(100):
            User(
                name=fake.name(),
                email=fake.safe_email(),
                plain_password='1',
                roles=['user']
            ).save()

        # TODO: Create a base corpus
