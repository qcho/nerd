import { MaybeCredentials, Credentials } from "../types/Credentials";

const authKey = "auth";

export default class CredentialsStorage {
  private static listeners: any[] = [];

  static getStored(): MaybeCredentials {
    const stored = localStorage[authKey] || sessionStorage[authKey];
    return stored == null ? null : JSON.parse(stored);
  }

  static clear() {
    CredentialsStorage.doClear();
    CredentialsStorage.notifyListeners();
  }

  static registerChangeListener(listener: any) {
    CredentialsStorage.listeners.push(listener);
  }

  static removeChangeListener(listener: any) {
    const index = CredentialsStorage.listeners.indexOf(listener, 0);
    if (index > -1) {
      CredentialsStorage.listeners.splice(index, 1);
    }
  }

  static save(credentials: Credentials, sessionOnly: boolean) {
    CredentialsStorage.doClear();
    const storage = sessionOnly ? sessionStorage : localStorage;
    storage[authKey] = JSON.stringify(credentials);
    CredentialsStorage.notifyListeners();
  }

  private static doClear() {
    localStorage.removeItem(authKey);
    sessionStorage.removeItem(authKey);
  }

  private static notifyListeners() {
    CredentialsStorage.listeners.forEach((listener) => {
      listener();
    })
  }
}
