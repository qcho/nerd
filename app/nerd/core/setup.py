from nerd.core.document.corpus import Text, Training
from nerd.core.document.snapshot import Snapshot, Type, CURRENT_ID
from nerd.core.document.user import User
from nerd.core.model import Model


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
            Text.drop_collection()
            Training.drop_collection()

        if drop:
            Snapshot.drop_collection()
            Snapshot.id.set_next_value(0)
        types = {
            "PER": Type(label="Person", color="#f44336"),
            "LOC": Type(label="Location", color="#9c27b0"),
            "ORG": Type(label="Organization", color="#3f51b5"),
            "MISC": Type(label="Miscellaneous", color="#00bcd4"),
        }
        current = Snapshot(
            id=CURRENT_ID,
            types={
                **types,
                **{"DATE": Type(label="Date", color="#ff9800")}
            }
        ).save()
        Model(current).train()

        genesis = Snapshot(types=types).save()
        Model(genesis).train()

    @staticmethod
    def dev_setup(drop: bool):
        from faker import Faker
        from faker.providers import internet

        fake = Faker()
        fake.add_provider(internet)

        NERdSetup.setup(drop)

        for _ in range(100):
            User(
                name=fake.name(),
                email=fake.safe_email(),
                plain_password='1',
                roles=['user']
            ).save()
