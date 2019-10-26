from nerd.core.document.corpus import Text, Training
from nerd.core.document.snapshot import Snapshot, Type, CURRENT_ID
from nerd.core.document.user import User, Role
from nerd.core.model import Model
from .util import get_logger


logger = get_logger(__name__)

class NERdSetup:
    @staticmethod
    def setup(drop: bool):
        if User.objects.count() and not drop:
            return logger.warning('Instance already set-up. You may call setup again with "--drop" to force reset.')
        if drop:
            User.drop_collection()
        User(
            name='Admin',
            email='admin@example.com',
            plain_password='1',
            roles=map(lambda role: role.value, [Role.USER, Role.TRAINER, Role.ADMIN])
        ).save()

        if drop:
            Text.drop_collection()
            Training.drop_collection()

        if drop:
            Snapshot.drop_collection()
            Snapshot.id.set_next_value(0)
        types = {
            "PER": Type(label="Person", color="#f44336", description="Nombres propios, incluyendo: personajes ficticios, nombres, apellidos y apodos."),
            "LOC": Type(label="Location", color="#9c27b0", description="Paises, ciudades, estados, provincias, municipios, etc."),
            "ORG": Type(label="Organization", color="#3f51b5", description="Empresas, agencias de gobierno, instituciones educacionales, equipos de fútbol, hospitales, museos, bibliotecas, etc."),
            "MISC": Type(label="Miscellaneous", color="#00bcd4", description="Palabras claves o términos importantes."),
        }
        current = Snapshot(
            id=CURRENT_ID,
            types={
                **types,
                **{"DATE": Type(label="Date", color="#ff9800", description="Fechas tanto completas como relativas: '10 de Diciembre', 'ayer', etc.")}
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
                plain_password='1'
            ).save()
