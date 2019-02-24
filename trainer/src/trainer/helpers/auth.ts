import Http from "./http";

export class Auth {
  static async doLogin(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    message: any;
  }> {
    try {
      let loginResult = await Http.anonymousRequest().post("/auth/login", {
        email: email,
        password: password
      });
      const data = loginResult.data;
      return Auth.authResult(true, data);
    } catch (e) {
      return this.authResult(
        false,
        Http.handleRequestError(e, (status: number, data: any) => {
          if (status == 401) {
            return "Invalid credentials";
          }
          return data.message;
        })
      );
    }
  }

  static async register(name: string, email: string, password: string) {
    try {
      let registerResult = await Http.anonymousRequest().post(
        "/auth/register",
        {
          name,
          email,
          password
        }
      );
      return this.authResult(true, registerResult.data);
    } catch (e) {
      return this.authResult(
        false,
        Http.handleRequestError(e, (_, data: any) => {
          return data.message;
        })
      );
    }
  }

  private static authResult(success: boolean, message: any = null) {
    return { success, message };
  }
}
