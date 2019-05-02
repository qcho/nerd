
def resolver(schema):
    name = schema.__name__
    if name is 'NestedSchema':
        meta = getattr(schema, "Meta", None)
        return meta.model.__name__
    if name.endswith("Schema"):
        return name[:-6] or name
    return name
