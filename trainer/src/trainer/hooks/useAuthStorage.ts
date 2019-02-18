import React, { useState, useEffect } from "react";
import { MaybeCredentials, Credentials } from "../types/Credentials";
import CredentialsStorage from "../helpers/CredentialsStorage";

export default function useAuthStorage() {
  const [credentials, setCredentials] = useState<MaybeCredentials>(
    CredentialsStorage.getStored()
  );

  useEffect(() => {
    const onStorageUpdate = () =>
      setCredentials(CredentialsStorage.getStored());
    CredentialsStorage.registerChangeListener(onStorageUpdate);
    return () => {
      CredentialsStorage.removeChangeListener(onStorageUpdate);
    };
  }, []);

  function updateCredentials(
    authCredentials: Credentials,
    sessionOnly: boolean = true
  ) {
    CredentialsStorage.save(authCredentials, sessionOnly);
  }
  function clearCredentials() {
    CredentialsStorage.clear();
  }

  return {
    credentials,
    updateCredentials,
    clearCredentials
  };
}
