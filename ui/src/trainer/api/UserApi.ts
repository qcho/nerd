import Http from "../helpers/http";
import { User } from "../types/User";

export default class UserApi {
  static async list() {
    try {
      // const { data } = await Http.authenticatedRequest().get("/users");
      return [];
    } catch (error) {
      throw new Error(
        Http.handleRequestError(error, (status, data) => {
          return "Error fetching user list";
        })
      );
    }
  }

  static async toggleAdmin(user: User, isAdmin: boolean) {
    try {
      // const { status } = await Http.authenticatedRequest().put(
      //   "/users/toggle_admin",
      //   {
      //     email: user.email,
      //     value: isAdmin
      //   }
      // );
      return;
    } catch (error) {
      throw new Error(
        Http.handleRequestError(error, (status, data) => {
          return isAdmin ? "Error making admin" : "Error removing admin";
        })
      );
    }
  }
}
