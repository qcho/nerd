from nerd.apis.schemas import TrainedTextSchema, TypeSchema


def register_custom_schemas(spec):
    spec.components.schema("Type", schema=TypeSchema)
    spec.components.schema('TrainedText', schema=TrainedTextSchema)
