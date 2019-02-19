import React, { useState, useEffect } from "react";
import { Auth } from "../helpers/auth";
import useAuthStorage from "./useAuthStorage";

function useAuthentication() {
  const { credentials, updateCredentials, clearCredentials } = useAuthStorage();
  let [loggedIn, setLoggedIn] = useState<boolean>(false);

  async function login(
    username: string,
    password: string,
    rememberMe: boolean
  ) {
    const loginResult = await Auth.doLogin(username, password, rememberMe);
    if (loginResult.success) {
      updateCredentials(loginResult.message, !rememberMe);
    }
    return loginResult;
  }

  useEffect(() => {
    setLoggedIn(credentials != null);
  }, [credentials]);

  async function register(name: string, username: string, password: string, rememberMe: boolean) {
    // TODO:
    const registerResult = await Auth.register(name, username, password);
    if (registerResult === undefined) {
      // TODO
      return;
    }
    if (registerResult.success) {
      updateCredentials(registerResult.message, !rememberMe)
    }
  }

  function logout() {
    clearCredentials();
  }

  return {
    login,
    logout,
    loggedIn,
    register,
    credentials
  };
}

export default useAuthentication;
