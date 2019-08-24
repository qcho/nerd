import React, { useState } from 'react';
import { Theme, Paper } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { UsersApi, User, RoleList, RolesApi } from '../apigen';
import { apiConfig } from '../helpers/api-config';
import Http from '../helpers/http';
import { makeStyles } from '@material-ui/styles';
import { RichTable, DatasourceParameters } from '../rich_table/RichTable';
import UserRow from './UserRow';
import { Scaffold } from '../scaffold/Scaffold';

const useStyles = makeStyles(
  (theme: Theme) => ({
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

  const buildRow = (value: User) => <UserRow user={value} availableRoles={roles} />;
  const datasource = async (params: DatasourceParameters) => {
    try {
      if (unmounted) return;
      setLoading(true);
      const users = await userApi.listUsers(params.page, params.pageSize, params.searchText);
      const rolesResponse = await roleApi.listRoles();
      if (unmounted) return;
      setRoles(rolesResponse.data);
      return users;
    } catch (e) {
      if (unmounted) return;
      // TODO: Set error
      const errorMessage = Http.handleRequestError(e, (status, data) => {
        console.log('Error loading users', data);
        return '';
      });
    } finally {
      if (!unmounted) setLoading(false);
    }
  };

  return (
    <Scaffold title={t('User management')} loading={loading}>
      <Paper className={classes.content}>
        <RichTable
          title={t('Users')}
          headers={headers}
          valueToId={(value: User) => value.email}
          rowBuilder={buildRow}
          datasource={datasource}
          onDelete={onDelete}
          searchable
          paginatable
        />
      </Paper>
    </Scaffold>
  );
};

export default UserManagement;
