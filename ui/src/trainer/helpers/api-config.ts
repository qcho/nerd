import CredentialsStorage from './CredentialsStorage';
import { Configuration } from '../apigen';

export function apiConfig(): Configuration {
  const credentials = CredentialsStorage.getStored();
  if (credentials == null) {
    return {};
  }
  return { accessToken: credentials.access_token };
}
