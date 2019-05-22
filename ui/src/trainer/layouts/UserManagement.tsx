import React, { useState } from 'react';
import { Theme, Paper } from '@material-ui/core';
import NavigationBar from '../NavigationBar';
import { useTranslation } from 'react-i18next';
import { UsersApi, User, RoleList, RolesApi } from '../apigen';
import { apiConfig } from '../helpers/api-config';
import Http from '../helpers/http';
import { makeStyles } from '@material-ui/styles';
import { RichTable, DatasourceParameters } from '../widgets/RichTable';
import UserRow from '../widgets/UserRow';

const useStyles = makeStyles(
  (theme: Theme) => ({
    grow: {
      flexGrow: 1,
    },
    content: {
      marginTop: theme.spacing.unit * 2,
      marginLeft: theme.spacing.unit * 10,
      marginRight: theme.spacing.unit * 10,
    },
  }),
  { withTheme: true },
);

const UserManagement = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const classes = useStyles();
  const [roles, setRoles] = useState<RoleList>({});
  const [t] = useTranslation();
  const userApi = new UsersApi(apiConfig());
  const roleApi = new RolesApi(apiConfig());
  let unmounted = false;

  const headers = [
    { id: 'name', label: t('Name') },
    { id: 'email', label: t('Email') },
    { id: 'roles', label: t('Roles') },
    { id: 'trainings', label: t('Trainings') },
  ];

  const onDelete = async (rows: User[]) => {
    try {
      setLoading(true);
      await Promise.all(rows.map(user => userApi.deleteUser(user.email)));
    } catch (e) {
      // TODO: Handle errors
    } finally {
      setLoading(false);
    }
  };

  const buildColumns = (value: User) => <UserRow user={value} availableRoles={roles} />;
  const datasource = async (params: DatasourceParameters) => {
    try {
      if (unmounted) return;
      setLoading(true);
      const users = await userApi.listUsers(params.page, params.pageSize, params.searchText);
      const rolesResponse = await roleApi.listRoles();
      if (unmounted) return;
      setRoles(rolesResponse.data);
      return {
        records: users.data as any[],
        headers: users.headers,
      };
    } catch (e) {
      if (unmounted) return;
      // TODO: Set error
      const errorMessage = Http.handleRequestError(e, (status, data) => {
        console.log('Error loading users', data);
        return '';
      });
    } finally {
      if (unmounted) return;
      setLoading(false);
    }
  };

  return (
    <div className={classes.grow}>
      <NavigationBar title={t('User management')} loading={loading} />
      <Paper className={classes.content}>
        <RichTable
          title={t('Users')}
          headers={headers}
          valueToId={(value: User) => value.email}
          columnBuilder={buildColumns}
          datasource={datasource}
          onDelete={onDelete}
          searchable
          paginatable
        />
      </Paper>
    </div>
  );
};

export default UserManagement;
