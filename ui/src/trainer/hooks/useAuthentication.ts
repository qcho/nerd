import { useState, useEffect } from 'react';
import { AuthApi } from '../apigen/api';
import useAuthStorage from './useAuthStorage';
import Http from '../helpers/http';
import { useTranslation } from 'react-i18next';

function useAuthentication() {
  const { credentials, updateCredentials, clearCredentials } = useAuthStorage();
  let [loggedIn, setLoggedIn] = useState<boolean>(false);
  let [isAdmin, setIsAdmin] = useState<boolean>(false);
  let [isUser, setIsUser] = useState<boolean>(false);
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
      const roles = credentials.roles || [];
      setIsAdmin(roles.includes('admin'));
      setIsUser(roles.includes('user'));
    } else {
      setIsAdmin(false);
      setIsUser(false);
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
  }

  return {
    login,
    logout,
    loggedIn,
    isAdmin,
    isUser,
    register,
    credentials,
  };
}

export default useAuthentication;
