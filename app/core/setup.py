from core.document.corpus import SystemCorpus, NERType, NERdCorpus
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
            SystemCorpus.drop_collection()
        SystemCorpus(
            name='Spanish (medium)',
            spacy_model='es_core_news_md',
            types={
                'PER': NERType(label='Person', color='#903d3d'),
                'LOC': NERType(label='Location', color='#b83ca6'),
                'ORG': NERType(label='Organization', color='#e1d458'),
                'MISC': NERType(label='Miscellaneous', color='#38dd9e')
            }
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
