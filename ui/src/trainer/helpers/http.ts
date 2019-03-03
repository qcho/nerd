import Axios, { AxiosInstance, AxiosError } from "axios";
import CredentialsStorage from "./CredentialsStorage";
import Config from "../config";
import { Credentials } from "../types/Credentials";

let currentCallback: Promise<string> | null = null;

async function refreshToken(credentials: Credentials) {
  try {
    const response = await Axios.create({
      baseURL: Config.serverURL,
      headers: {
        "Content-Type": "application/json"
      }
    }).post("/auth/refresh", {
      refresh_token: credentials.refresh_token
    });
    credentials!.access_token = response.data.access_token;
    CredentialsStorage.update(credentials!);
    return Promise.resolve(credentials!.access_token);
  } catch (error) {
    return Promise.reject(error);
  }
}

function addInterceptors(instance: AxiosInstance) {
  const id = instance.interceptors.response.use(
    undefined,
    (error: AxiosError) => {
      const credentials = CredentialsStorage.getStored();
      if (!error.response || !credentials) {
        return Promise.reject(error);
      }
      let response = error.response;
      let { status, data } = response;
      if (
        status != 401 ||
        !data.message ||
        response.data.message != "Access token expired"
      ) {
        return Promise.reject(error);
      }
      instance.interceptors.response.eject(id);

      if (!currentCallback) {
        currentCallback = refreshToken(credentials);
      }

      return currentCallback
        .then((accessToken: string) => {
          currentCallback = null;
          response.config.headers["Authorization"] = accessToken;
          return Axios.request(response.config);
        })
        .catch(() => {
          currentCallback = null;
          return Promise.reject(error);
        });
    }
  );
  return instance;
}

class Http {

  static handleRequestError(error: any, onResponseReceived: (status: number, data: any) => string) {
    if (error.response) {
      return onResponseReceived(error.response.status, error.response.data);
    } else if (error.request) {
      return "Couldn't reach the server";
    }
    return "There was an error setting up the request";
  }

  static authenticatedRequest(): AxiosInstance {
    const credentials = CredentialsStorage.getStored();
    if (credentials == null) {
      throw new Error("Credentials can't be null");
    }
    return addInterceptors(
      this.createInstance({
        headers: {
          Authorization: credentials.access_token
        }
      })
    );
  }

  static anonymousRequest(): AxiosInstance {
    return this.createInstance();
  }

  private static createInstance(extraSettings: any = {}) {
    const defaultConfig = {
      baseURL: Config.serverURL
    };
    return Axios.create({ ...defaultConfig, ...extraSettings });
  }
}

export default Http;
