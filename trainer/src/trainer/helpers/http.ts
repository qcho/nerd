import Axios, { AxiosInstance } from "axios";
import CredentialsStorage from "./CredentialsStorage";

export class Http {
  static baseURL = "http://localhost:5000";

  static urlFor(path: string): string {
    let trimmedPath = path.trim();
    if (trimmedPath.length == 0) {
      trimmedPath = "/";
    } else if (trimmedPath[0] != "/") {
      trimmedPath = "/" + trimmedPath;
    }
    return Http.baseURL + trimmedPath;
  }

class Http {
  static authenticatedRequest(): AxiosInstance {
    const credentials = CredentialsStorage.getStored();
    if (credentials == null) {
      throw new Error("Credentials can't be null");
    }
    return Axios.create({
      baseURL: Http.baseURL,
      headers: {
        Authorization: credentials.access_token
      }
    });
  }

  static anonymousRequest(): AxiosInstance {
      return Axios.create({
          baseURL: Http.baseURL
      });
  }
}

export default Http;
