import { EntityType, MaybeEntityType } from "../types/EntityType";
import { Http } from "../helpers/http";

class EntityTypeApi {
  async availableTypes(modelName: string): Promise<EntityType[]> {
    const request = Http.anonymousRequest();
    const response = await request.get(`/models/${modelName}/entity-types`);
    if (response.status == 200) {
      return response.data;
    } else {
      // TODO: This should correctly handle status != 200
      throw Error("There was an error retrieving entity types");
    }
  }
}

export default EntityTypeApi;
