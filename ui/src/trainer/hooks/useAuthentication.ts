import React, { useState, useEffect } from "react";
import { AuthApi } from "../apigen/api";
import useAuthStorage from "./useAuthStorage";
import Http from "../helpers/http";
import nsps from "../helpers/i18n-namespaces";
import { useTranslation } from "react-i18next";

function useAuthentication() {
  const { credentials, updateCredentials, clearCredentials } = useAuthStorage();
  let [loggedIn, setLoggedIn] = useState<boolean>(false);
  let [isAdmin, setIsAdmin] = useState<boolean>(false);
  let [isUser, setIsUser] = useState<boolean>(false);
  const [t] = useTranslation(nsps.authentication);
  const api = new AuthApi();

  async function login(
    username: string,
    password: string,
    rememberMe: boolean
  ) {
    try {
      const loginResult = await api.createAccessToken({
        username,
        password,
        grant_type: "password"
      });
      console.log("Login result", [loginResult.data]);
      updateCredentials(loginResult.data, !rememberMe);
      return { success: true, message: "" };
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
          return t("Invalid credentials");
        }
        return t("Can't login");
      });
      return { success: false, message: errorMessage };
    }
  }

  useEffect(() => {
    const hasCredentials = credentials != null;
    setLoggedIn(hasCredentials);
    if (hasCredentials) {
      const roles = credentials!.roles || [];
      setIsAdmin(roles.includes("admin"));
      setIsUser(roles.includes("user"));
    } else {
      setIsAdmin(false);
      setIsUser(false);
    }
  }, [credentials]);

  async function register(
    name: string,
    username: string,
    password: string,
    rememberMe: boolean
  ) {
    try {
      const registerResult = await api.registerUser({
        name,
        email: username,
        plain_password: password
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
    credentials
  };
}

export default useAuthentication;
