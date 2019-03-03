import React, { useState, useEffect } from "react";
import { Auth } from "../helpers/auth";
import useAuthStorage from "./useAuthStorage";

function useAuthentication() {
  const { credentials, updateCredentials, clearCredentials } = useAuthStorage();
  let [loggedIn, setLoggedIn] = useState<boolean>(false);
  let [isAdmin, setIsAdmin] = useState<boolean>(false);

  async function login(
    username: string,
    password: string,
    rememberMe: boolean
  ) {
    const loginResult = await Auth.doLogin(username, password);
    if (loginResult.success) {
      updateCredentials(loginResult.message, !rememberMe);
    }
    return loginResult;
  }

  useEffect(() => {
    const hasCredentials = credentials != null;
    setLoggedIn(hasCredentials);
    setIsAdmin(hasCredentials && credentials!.roles.includes("admin"))
  }, [credentials]);

  async function register(name: string, username: string, password: string, rememberMe: boolean) {
    const registerResult = await Auth.register(name, username, password);
    if (registerResult.success) {
      updateCredentials(registerResult.message, !rememberMe)
    }
    return registerResult;
  }

  function logout() {
    clearCredentials();
  }

  return {
    login,
    logout,
    loggedIn,
    isAdmin,
    register,
    credentials
  };
}

export default useAuthentication;
