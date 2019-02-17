import { Http } from "../helpers/http";
import { NerDocument } from "../types/NerDocument";

export default class NerApi {
  private modelName: string;

  constructor(modelName: string) {
    this.modelName = modelName;
  }

  async parseText(text: string) {
    const request = Http.anonymousRequest();
    const response = await request.get(`/models/${this.modelName}/ner`, {
      params: { text }
    });

    if (response.status == 200) {
      return response.data;
    } else {
        // TODO: Handle error
    }
  }

  async saveDocument(document: NerDocument) {
    const request = Http.authenticatedRequest();
    const response = await request.post(`/models/${this.modelName}/ner`, document);
    if (response.status == 200) {
        return;
    } else {
        // TODO: Handle error
    }
  }
}
