import React, { useState } from "react";
import { MaybeCredentials, Credentials } from "../types/Credentials";

export default function useAuthStorage() {
    const authKey = "auth";
    let storedSerializedCredentials =
      localStorage[authKey] || sessionStorage[authKey];
    const storedCredentials =
      storedSerializedCredentials != null
        ? JSON.parse(storedSerializedCredentials)
        : null;
    const [credentials, setCredentials] = useState<MaybeCredentials>(
      storedCredentials
    );

    function updateCredentials(
      authCredentials: Credentials,
      sessionOnly: boolean = true
    ) {
      clearStorage();
      const storage = sessionOnly ? sessionStorage : localStorage;
      storage[authKey] = JSON.stringify(authCredentials);
      setCredentials(authCredentials);
    }

    function clearStorage() {
      localStorage.removeItem(authKey);
      sessionStorage.removeItem(authKey);
    }

    function clearCredentials() {
      clearStorage();
      setCredentials(null);
    }

    return {
      credentials,
      updateCredentials,
      clearCredentials
    };
  }
