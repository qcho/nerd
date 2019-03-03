import { EntityType, MaybeEntityType } from "../types/EntityType";
import Http from "../helpers/http";

class EntityTypeApi {
  async availableTypes(modelName: string): Promise<EntityType[]> {
    const request = Http.anonymousRequest();
    try {
      const response = await request.get(`/models/${modelName}/entity-types`);
      return response.data;
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
