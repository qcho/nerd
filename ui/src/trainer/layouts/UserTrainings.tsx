import React, { useEffect, useCallback } from 'react';
import NavigationBar from '../NavigationBar';
import { UsersApi } from '../apigen';
import { apiConfig } from '../helpers/api-config';

const UserTrainings = ({ match }: { match: any }) => {
  const userApi = new UsersApi(apiConfig());

  // const fetchTrainings = useCallback(async () => {

  // })

  useEffect(() => {}, []);

  return (
    <div>
      <NavigationBar loading={false} />
    </div>
  );
};

export { UserTrainings };
