import Http from "../helpers/http";
import { NerDocument } from "../types/NerDocument";

export default class NerApi {
  private modelName: string;

  constructor(modelName: string) {
    this.modelName = modelName;
  }

  async parseText(text: string) {
    try {
      const response = await Http.anonymousRequest().get(
        `/models/${this.modelName}/ner`,
        {
          params: { text }
        }
      );

      return response.data;
    } catch (error) {
      // TODO: We could differenciate errors from the backend
      throw Error(Http.handleRequestError(error, () => "Couldn't parse text"));
    }
  }

  async save(document: NerDocument) {
    try {
      await Http.authenticatedRequest().put(
        `/models/${this.modelName}/ner`,
        document
      );
    } catch (error) {
      // TODO: We could differenciate errors from the backend
      throw Error(
        Http.handleRequestError(error, () => "Couldn't save updated entities")
      );
    }
  }
}
