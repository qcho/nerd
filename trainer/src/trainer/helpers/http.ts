import Axios, { AxiosInstance } from "axios";
import CredentialsStorage from "./CredentialsStorage";
import Config from "../config";

function addInterceptors(instance: AxiosInstance) {
  // instance.interceptors.response.use(undefined, (error: any) => {

  // });
  return instance;
}

class Http {
  static authenticatedRequest(): AxiosInstance {
    const credentials = CredentialsStorage.getStored();
    if (credentials == null) {
      throw new Error("Credentials can't be null");
    }
    return this.createInstance({
      headers: {
        Authorization: credentials.access_token
      }
    });
  }

  static anonymousRequest(): AxiosInstance {
    return this.createInstance();
  }

  private static createInstance(extraSettings: any = {}) {
    const defaultConfig = {
      baseURL: Config.serverURL
    };
    return addInterceptors(
      Axios.create({ ...defaultConfig, ...extraSettings })
    );
  }
}

export default Http;
