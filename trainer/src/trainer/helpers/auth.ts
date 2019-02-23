import Http from "./http";

export class Auth {
  static isLoggedIn() {}

  static async refreshToken(): Promise<any> {
    // TODO: Get refresh token from local storage
    let refreshToken = "";
    return new Promise((resolve, reject) => {
      Http.anonymousRequest().post("/auth/refresh", {
        refresh_token: refreshToken
      });
    });
  }

  static async doLogin(
    username: string,
    password: string,
    rememberMe: boolean
  ): Promise<{
    success: boolean;
    message: any;
  }> {
    try {
      let loginResult = await Http.anonymousRequest().post(
        "/auth/login",
        {
          username: username,
          password: password
        }
      );
      if (loginResult.status == 200) {
        const data = loginResult.data;
        return Auth.loginResult(true, data);
      } else {
        // TODO: Is this possible?
        return Auth.loginResult(false, `Status code: ${loginResult.status}`);
      }
    } catch (e) {
      if (e.response) {
        // TODO: Response received with errors:
        // Handle different error codes
        const response = e.response;
        if (response.status == 401) {
          return Auth.loginResult(false, "Invalid credentials");
        } else if (response.status == 400) {
          return Auth.loginResult(false, response.data.msg);
        }
      } else if (e.request) {
        // TODO: Request made but received no response
        return Auth.loginResult(
          false,
          "Didn't receive a response from the server :("
        );
      } else {
        // TODO: Couldn't set up the request
        return Auth.loginResult(
          false,
          "There was a problem setting up the request"
        );
      }
    }
    // TODO: This shouldn't be necessary
    return Auth.loginResult(false, "Impossible situation");
  }

  static async register(name: string, email: string, password: string) {
    try {
      let registerResult = await Http.anonymousRequest().post("/auth/register", {
        name,
        email,
        password
      });
      // TODO: Correctly handle this
      if (registerResult.status == 200) {
        console.log(registerResult.data);
        return Auth.loginResult(true, registerResult.data);
      } else {
        console.log("Registration error");
        console.log(registerResult);
      }
    } catch (e) {
      console.log("Registration error");
      console.log(e);
    }
  }

  private static loginResult(success: boolean, message: any = null) {
    return { success, message };
  }
}
