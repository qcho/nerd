import { EntityType, MaybeEntityType } from "../types/EntityType";

class EntityTypeApi {
  availableTypes(): EntityType[] {
    return [
      {
        name: "Person",
        code: "PER",
        color: "#903d3d"
      },
      {
        name: "Location",
        code: "LOC",
        color: "#b83ca6"
      },
      {
        name: "Organization",
        code: "ORG",
        color: "#e1d458"
      },
      {
        name: "Miscellaneous",
        code: "MISC",
        color: "#38dd9e"
      }
    ];
  }

  refresh() {

  }

  typeFor(code: string): MaybeEntityType {
      let entityTypes = this.availableTypes();
      for (let i = 0; i < entityTypes.length; ++i) {
          let entityType = entityTypes[i];
          if (entityType.code == code) {
              return entityType;
          }
      }
      return null;
  }
}

export default EntityTypeApi;
