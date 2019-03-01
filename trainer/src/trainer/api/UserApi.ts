import Http from "../helpers/http";

export default class UserApi {
  static async list() {
    try {
      const { data } = await Http.authenticatedRequest().get("/users");
      return data;
    } catch (error) {
        throw new Error(Http.handleRequestError(error, (status, data) => {
            return "Error fetching user list";
        }))
    }
  }
}
