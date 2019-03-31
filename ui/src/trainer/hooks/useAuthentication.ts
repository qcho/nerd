import React, { useState, useEffect } from "react";
import { Auth } from "../helpers/auth";
import { Token, AuthApi } from "../apigen/api";
import useAuthStorage from "./useAuthStorage";
import Http from "../helpers/http";

function useAuthentication() {
  const { credentials, updateCredentials, clearCredentials } = useAuthStorage();
  let [loggedIn, setLoggedIn] = useState<boolean>(false);
  let [isAdmin, setIsAdmin] = useState<boolean>(false);
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
      var errors = {};
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
          return "Invalid credentials";
        }
        return "Can't login";
      });
      return { success: false, message: errorMessage };
    }
  }

  useEffect(() => {
    const hasCredentials = credentials != null;
    setLoggedIn(hasCredentials);
    // TODO
    if (hasCredentials) {
      const roles = credentials!.roles || [];
      setIsAdmin(roles.includes("admin"));
    }
  }, [credentials]);

  async function register(
    name: string,
    username: string,
    password: string,
    rememberMe: boolean
  ) {
    let result = {success: false, message: ""};
    try {
      const registerResult = await api.registerUser({name, email: username, plain_password: password})
      updateCredentials(registerResult.data, !rememberMe);
      result.success = true;
    } catch (e) {
      result.message = Http.handleRequestError(e, (status, data) => {
        // TODO: Find out what data has. Unknown after qcho's refactor
        return "TODO";
      });
      return result;
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
    register,
    credentials
  };
}

export default useAuthentication;
