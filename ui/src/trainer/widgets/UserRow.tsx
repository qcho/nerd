import React, { useState } from "react";
import { User, RoleList, UsersApi } from "../apigen";
import {
  TableRow,
  TableCell,
  Select,
  MenuItem,
  Button,
  Theme,
  Chip,
  OutlinedInput,
  InputBase
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import nsps from "../helpers/i18n-namespaces";
import { makeStyles } from "@material-ui/styles";
import { apiConfig } from "../helpers/api-config";

const useStyles = makeStyles(
  (theme: Theme) => {
    return {
      chips: {
        display: "flex",
        flexWrap: "wrap"
      },
      chip: {
        margin: theme.spacing.unit / 4
      },
      dropDown: {
        position: "relative",
        width: "auto",
        paddingLeft: "5px"
      }
    };
  },
  { withTheme: true }
);

type Props = {
  user: User;
  roles: RoleList;
  onDelete: any;
};

const UserRow = ({ user, roles, onDelete }: Props) => {
  const [t] = useTranslation(nsps.userManagement);
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
        email: user.email,
        roles: values
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
      return <em>{t("None")}</em>;
    }
    return (
      <div className={classes.chips}>
        {roles.map((value: string) => (
          <Chip key={value} label={value} className={classes.chip} />
        ))}
      </div>
    );
  }

  return (
    <TableRow>
      <TableCell>{user.name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        {roles.roles !== undefined && (
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
              <em>{t("Roles")}</em>
            </MenuItem>
            {roles.roles!.map(name => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        )}
      </TableCell>
      <TableCell align="center">
        <Button
          onClick={() => onDelete(user)}
          variant="outlined"
          color="secondary"
          size="small"
        >
          {t("Delete")}
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default UserRow;
