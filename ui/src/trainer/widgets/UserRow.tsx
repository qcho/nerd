import React, { useState } from 'react';
import { User, RoleList, UsersApi } from '../apigen';
import { TableCell, Select, MenuItem, Theme, Chip, InputBase, Link, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/styles';
import { apiConfig } from '../helpers/api-config';
import { Link as RRDLink } from 'react-router-dom';
import { Routes } from '../helpers/routeHelper';

const useStyles = makeStyles(
  (theme: Theme) => ({
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    chip: {
      margin: theme.spacing.unit / 4,
    },
    dropDown: {
      position: 'relative',
      width: 'auto',
      paddingLeft: '5px',
    },
  }),
  { withTheme: true },
);

interface Props {
  user: User;
  availableRoles: RoleList;
}

const UserRow = ({ user, availableRoles: roles }: Props) => {
  const [t] = useTranslation();
  const classes = useStyles();
  const [userRoles, setUserRoles] = useState<string[]>(user.roles || []);
  const [loading, setLoading] = useState<boolean>(false);
  const userApi = new UsersApi(apiConfig());
  async function onRoleChange(values: string[]) {
    user.roles = values;
    setUserRoles(values);
    setLoading(true);
    try {
      let result = await userApi.updateUser(user.email, {
        roles: values,
      });
      setUserRoles(result.data.roles || []);
    } catch (e) {
      // TODO: Display error
    } finally {
      setLoading(false);
    }
  }

  function renderRoles(value: any) {
    const roles: string[] = value as string[];
    if (roles.length == 0) {
      return <em>{t('None')}</em>;
    }
    return (
      <div className={classes.chips}>
        {roles.map((value: string) => (
          <Chip key={value} label={value} className={classes.chip} />
        ))}
      </div>
    );
  }

  const SelectRoles = () => (
    <Select
      multiple
      displayEmpty
      value={userRoles}
      disabled={loading}
      input={<InputBase className={classes.dropDown} />}
      onChange={event => {
        onRoleChange((event.target.value as unknown) as string[]);
      }}
      renderValue={selected => renderRoles(selected)}
    >
      <MenuItem disabled value="">
        <em>{t('Roles')}</em>
      </MenuItem>
      {roles.roles &&
        roles.roles.map(name => (
          <MenuItem key={name} value={name}>
            <Typography>{name}</Typography>
          </MenuItem>
        ))}
    </Select>
  );

  return (
    <>
      <TableCell>
        <Typography>{user.name}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{user.email}</Typography>
      </TableCell>
      <TableCell>{roles.roles !== undefined && <SelectRoles />}</TableCell>
      <TableCell>
        <Typography>
          <Link component={(props: any) => <RRDLink to={Routes.trainingsByUser.buildRoute(user)} {...props} />}>
            {user.total_trainings || 0}
          </Link>
        </Typography>
      </TableCell>
    </>
  );
};

export default UserRow;
