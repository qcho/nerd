import { MaybeCredentials, Credentials } from "../types/Credentials";

const authKey = "auth";

export default class CredentialsStorage {
  static getStored(): MaybeCredentials {
    const stored = localStorage[authKey] || sessionStorage[authKey];
    return stored == null ? null : JSON.parse(stored);
  }

  static clear() {
    localStorage.removeItem(authKey);
    sessionStorage.removeItem(authKey);
  }

  static save(credentials: Credentials, sessionOnly: boolean) {
    CredentialsStorage.clear();
    const storage = sessionOnly ? sessionStorage : localStorage;
    storage[authKey] = JSON.stringify(credentials);
  }
}
