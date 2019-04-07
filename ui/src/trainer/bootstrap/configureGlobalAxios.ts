import globalAxios, { AxiosInstance, AxiosError } from "axios";
import Axios from "axios";
import { AuthApi, Configuration, UserCredentials } from "../apigen";
import CredentialsStorage from "../helpers/CredentialsStorage";

async function refreshToken(credentials: UserCredentials) {
  try {
    const api = new AuthApi();
    const response = await api.refreshAccessToken("refresh_token", {
      headers: {
        Authorization: "Bearer " + credentials.refresh_token,
        "X-Last-Retry": true
      }
    });
    CredentialsStorage.update(response.data);
    return Promise.resolve(response.data.access_token);
  } catch (error) {
    return Promise.reject(error);
  }
}

function addInterceptors(instance: AxiosInstance) {
  instance.interceptors.response.use(undefined, async (error: AxiosError) => {
    const credentials = CredentialsStorage.getStored();
    if (!error.response || !credentials) {
      return Promise.reject(error);
    }
    let response = error.response;
    let { status, config } = response;
    if (status != 401 || config.headers["X-Last-Retry"]) {
      return Promise.reject(error);
    }
    try {
      const accessToken = await refreshToken(credentials);
      config.headers["Authorization"] = "Bearer " + accessToken;
      config.headers["X-Last-Retry"] = true;
      return Axios.request(config);
    } catch (e) {
      let response = e.response;
      if (e != undefined) {
        let { status } = e.response;
        if (status == 401) {
          CredentialsStorage.clear();
        }
      }
      return Promise.reject(error);
    }
  });
}

addInterceptors(globalAxios);
