import { MaybeCredentials, Credentials } from "../types/Credentials";

const authKey = "auth";

export default class CredentialsStorage {
  private static listeners: any[] = [];

  static getStored(): MaybeCredentials {
    const stored = this.getStorage()[authKey];
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
    this.store(credentials, storage);
    CredentialsStorage.notifyListeners();
  }

  static update(credentials: Credentials) {
    this.store(credentials, this.getStorage());
  }

  private static getStorage() {
    if (localStorage[authKey]) {
      return localStorage;
    }
    return sessionStorage;
  }

  private static store(credentials: Credentials, storage: Storage) {
    storage[authKey] = JSON.stringify(credentials);
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
