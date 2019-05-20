from nerd.core.document.corpus import Text, TrainedText
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
            TrainedText.drop_collection()

        if drop:
            Snapshot.drop_collection()
            Snapshot.id.set_next_value(0)
        current = Snapshot(
            id=CURRENT_ID,
            types={
                "PER": Type(label="Person", color="#903d3d"),
                "LOC": Type(label="Location", color="#b83ca6"),
                "ORG": Type(label="Organization", color="#e1d458"),
                "MISC": Type(label="Miscellaneous", color="#38dd9e"),
                "DATE": Type(label="Date", color="#e56262")
            }
        ).save()
        Model(current).train()

        genesis = Snapshot(
            types={
                "PER": Type(label="Person", color="#903d3d"),
                "LOC": Type(label="Location", color="#b83ca6"),
                "ORG": Type(label="Organization", color="#e1d458"),
                "MISC": Type(label="Miscellaneous", color="#38dd9e")
            }
        ).save()
        Model(genesis).train()

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
