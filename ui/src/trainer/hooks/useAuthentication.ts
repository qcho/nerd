import { useState, useEffect } from 'react';
import { AuthApi } from '../apigen/api';
import useAuthStorage from './useAuthStorage';
import Http from '../helpers/http';
import { useTranslation } from 'react-i18next';
import useReactRouter from 'use-react-router';
import { Role, roleFromString } from '../types/role';

function useAuthentication() {
  const { credentials, updateCredentials, clearCredentials } = useAuthStorage();
  const { history } = useReactRouter();
  let [loggedIn, setLoggedIn] = useState<boolean>(false);
  let [roles, setRoles] = useState<Role[]>([]);
  const [t] = useTranslation();
  const api = new AuthApi();

  async function login(username: string, password: string, rememberMe: boolean) {
    try {
      const loginResult = await api.createAccessToken({
        username,
        password,
        // eslint-disable-next-line @typescript-eslint/camelcase
        grant_type: 'password',
      });
      updateCredentials(loginResult.data, !rememberMe);
      return { success: true, message: '' };
    } catch (e) {
      const errorMessage = Http.handleRequestError(e, (status, data) => {
        if (status == 422) {
          const { errors } = data;
          if (errors.username) {
            return errors.username;
          }
          if (errors.password) {
            return errors.password;
          }
        }
        if (status == 401) {
          return t('Invalid credentials');
        }
        return t('There was a problem reaching the login server');
      });
      return { success: false, message: errorMessage };
    }
  }

  useEffect(() => {
    setLoggedIn(credentials != null);
    if (credentials != null) {
      const roles: string[] = credentials.roles || [];
      setRoles(roles.map(roleFromString));
    } else {
      setRoles([]);
    }
  }, [credentials]);

  async function register(name: string, username: string, password: string, rememberMe: boolean) {
    try {
      const registerResult = await api.registerUser({
        name,
        email: username,
        // eslint-disable-next-line @typescript-eslint/camelcase
        plain_password: password,
      });
      updateCredentials(registerResult.data, !rememberMe);
      return;
    } catch (e) {
      const errorMessage = Http.handleRequestError(e, (status, data) => {
        if (status === 422) {
          const { errors } = data;
          if (errors.email) return t(errors.email);
        }
        return t("Couldn't create user");
      });
      throw new Error(errorMessage);
    }
  }

  function logout() {
    clearCredentials();
    history.replace('/');
  }

  function hasRole(role: Role): boolean {
    return roles.indexOf(role) > -1;
  }

  return {
    login,
    logout,
    loggedIn,
    hasRole,
    register,
    credentials,
  };
}

export { useAuthentication };
