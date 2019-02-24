import Http from "../helpers/http";

export default class ModelApi {
  static async list() {
    try {
      const { data } = await Http.authenticatedRequest().get("/models");
      return data;
    } catch (error) {
      throw new Error(
        Http.handleRequestError(error, (status, data) => {
          return "Couldn't load models";
        })
      );
    }
  }

  static async listBase() {
    try {
      const { data } = await Http.authenticatedRequest().get("/base-models");
      return data;
    } catch (error) {
      throw new Error(
        Http.handleRequestError(error, (status, data) => {
          return "Couldn't base models";
        })
      );
    }
  }

  static async create(modelName: string, baseModel: string) {
    try {
      await Http.authenticatedRequest().post("/models", {
        model_name: modelName,
        base_model_name: baseModel
      });
    } catch (e) {
      throw Error(
        Http.handleRequestError(e, (status, data) => {
          if (status == 409) {
            return data.message;
          }
          return "Unknown error occurred";
        })
      );
    }
  }

  static async delete(modelName: string) {
    try {
      await Http.authenticatedRequest().delete(`/models/${modelName}`);
    } catch (e) {
      throw Error(
        Http.handleRequestError(e, (status, data) => {
          return data.message;
        })
      );
    }
  }
}
