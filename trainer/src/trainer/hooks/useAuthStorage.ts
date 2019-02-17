import React, { useState } from "react";
import { MaybeCredentials, Credentials } from "../types/Credentials";
import CredentialsStorage from "../helpers/CredentialsStorage";

export default function useAuthStorage() {
  let storedCredentials = CredentialsStorage.getStored();
  const [credentials, setCredentials] = useState<MaybeCredentials>(
    storedCredentials
  );

  function updateCredentials(
    authCredentials: Credentials,
    sessionOnly: boolean = true
  ) {
    CredentialsStorage.save(authCredentials, sessionOnly);
    setCredentials(authCredentials);
  }

  function clearCredentials() {
    CredentialsStorage.clear();
    setCredentials(null);
  }

  return {
    credentials,
    updateCredentials,
    clearCredentials
  };
}
