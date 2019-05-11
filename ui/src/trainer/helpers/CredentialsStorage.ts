import { UserCredentials } from '../apigen';
import { MaybeUserCredentials } from '../types/optionals';

const authKey = 'auth';

export default class CredentialsStorage {
  private static listeners: any[] = [];

  public static getStored(): MaybeUserCredentials {
    const stored = this.getStorage()[authKey];
    return stored == null ? null : JSON.parse(stored);
  }

  public static clear() {
    CredentialsStorage.doClear();
    CredentialsStorage.notifyListeners();
  }

  public static registerChangeListener(listener: any) {
    CredentialsStorage.listeners.push(listener);
  }

  public static removeChangeListener(listener: any) {
    const index = CredentialsStorage.listeners.indexOf(listener, 0);
    if (index > -1) {
      CredentialsStorage.listeners.splice(index, 1);
    }
  }

  public static save(credentials: UserCredentials, sessionOnly: boolean) {
    CredentialsStorage.doClear();
    const storage = sessionOnly ? sessionStorage : localStorage;
    this.store(credentials, storage);
    CredentialsStorage.notifyListeners();
  }

  public static update(credentials: UserCredentials) {
    this.store(credentials, this.getStorage());
  }

  private static getStorage() {
    if (localStorage[authKey]) {
      return localStorage;
    }
    return sessionStorage;
  }

  private static store(credentials: UserCredentials, storage: Storage) {
    storage[authKey] = JSON.stringify(credentials);
  }

  private static doClear() {
    localStorage.removeItem(authKey);
    sessionStorage.removeItem(authKey);
  }

  private static notifyListeners() {
    CredentialsStorage.listeners.forEach(listener => {
      listener();
    });
  }
}
