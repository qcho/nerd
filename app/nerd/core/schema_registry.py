from nerd.apis.schemas import TypeSchema


def register_custom_schemas(spec):
    spec.components.schema("Type", schema=TypeSchema)
    # spec.components.schema('Training', schema=TrainingSchema)
