from nerd.apis.corpus import TypeSchema


def register_custom_schemas(spec):
    spec.components.schema("Type", schema=TypeSchema)
