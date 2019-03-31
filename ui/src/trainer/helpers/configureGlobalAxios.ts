import globalAxios, { AxiosInstance, AxiosError } from "axios";
import CredentialsStorage from "./CredentialsStorage";
import Axios from "axios";
import { UserCredentials, Configuration, AuthApi } from "../apigen";
import { loggedConfig } from "./auth";

async function refreshToken(credentials: UserCredentials) {
  try {
    const { refresh_token } = credentials;
    const api = new AuthApi();
    const response = await api.refreshAccessToken({ refresh_token });
    console.log("Refreshed JWT.");
    CredentialsStorage.update(response.data);
    return Promise.resolve(response.data.access_token);
  } catch (error) {
    return Promise.reject(error);
  }
}

function addInterceptors(instance: AxiosInstance) {
  const id = instance.interceptors.response.use(
    undefined,
    async (error: AxiosError) => {
      const credentials = CredentialsStorage.getStored();
      if (!error.response || !credentials) {
        return Promise.reject(error);
      }
      let response = error.response;
      let { status, data, config } = response;
      if (status != 401 || config.headers["X-Last-Retry"]) {
        return Promise.reject(error);
      }
      try {
        const accessToken = await refreshToken(credentials);
        config.headers["Authorization"] = "Bearer " + accessToken;
        config.headers["X-Last-Retry"] = true;
        return Axios.request(config);
      } catch (e) {
        return Promise.reject(error);
      }
    }
  );
}

addInterceptors(globalAxios);
