from nerd.apis.corpus import TypeSchema, TrainedTextSchema


def register_custom_schemas(spec):
    spec.components.schema("Type", schema=TypeSchema)
    spec.components.schema('TrainedText', schema=TrainedTextSchema)
