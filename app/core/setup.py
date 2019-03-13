from core.document.corpus import SystemCorpus, NERType
from core.document.user import User


class NERdSetup:
    @staticmethod
    def setup(drop: bool):
        if drop:
            User.drop_collection()
        User(
            name='Qcho',
            email='qcho86@gmail.com',
            plain_password='1234',
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
