import marshmallow


def resolver(schema):
    if type(schema).__name__ is 'NestedSchema':
        name = schema.Meta.model.__name__
    elif isinstance(schema, marshmallow.Schema):
        name = type(schema).__name__
    else:
        name = schema.__name__
    if name.endswith("Schema"):
        name = name[:-6] or name
    return name
