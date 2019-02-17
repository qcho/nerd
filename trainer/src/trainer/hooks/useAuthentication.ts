import React, { useState, useEffect } from "react";
import { Auth } from "../helpers/auth";
import useAuthStorage from "./useAuthStorage";

function useAuthentication() {
  const { credentials, updateCredentials, clearCredentials } = useAuthStorage();
  const [loggedIn, setLoggedIn] = useState<boolean>(credentials != null);

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

  function logout() {
    clearCredentials();
  }

  return {
    login,
    logout,
    loggedIn,
    credentials
  };
}

export default useAuthentication;
