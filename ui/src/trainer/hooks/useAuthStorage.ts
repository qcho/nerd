import React, { useState, useEffect } from "react";
import CredentialsStorage from "../helpers/CredentialsStorage";
import { UserCredentials } from "../apigen";
import { MaybeUserCredentials } from "../types/optionals";

export default function useAuthStorage() {
  const [credentials, setCredentials] = useState<MaybeUserCredentials>(
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
    authCredentials: UserCredentials,
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
