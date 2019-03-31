import { EntityType, MaybeEntityType } from "../types/EntityType";
import Http from "../helpers/http";

class EntityTypeApi {
  async availableTypes(modelName: string): Promise<EntityType[]> {
    try {
      // const response = await Http.anonymousRequest().get(`/models/${modelName}/entity-types`);
      return [];
    } catch (e) {
      throw Error(
        Http.handleRequestError(
          e,
          () => "There was an error retrieving entity types"
        )
      );
    }
  }
}

export default EntityTypeApi;
