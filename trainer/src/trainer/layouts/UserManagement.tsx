import React, { useEffect, useState } from "react";
import {
  Theme,
  createStyles,
  withStyles,
  Grid,
  LinearProgress,
  Typography,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Button
} from "@material-ui/core";
import NavigationBar from "../NavigationBar";
import UserApi from "../api/UserApi";
import { useTranslation } from "react-i18next";
import nsps from "../helpers/i18n-namespaces";
import { User } from "../types/User";

const styles = (theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1
    },
    content: {
      marginTop: theme.spacing.unit * 2
    }
  });

const UserManagement = ({ classes }: { classes: any }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [t] = useTranslation(nsps.userManagement);

  function fetchUsers() {
    const doFetch = async () => {
      setLoading(true);
      setUsers(await UserApi.list());
    };
    doFetch().finally(() => {
      setLoading(false);
    });
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function onMakeAdmin(user: User) {
    setLoading(true);
    UserApi.toggleAdmin(user, true)
      .then(() => {
        fetchUsers();
      })
      .finally(() => setLoading(false));
  }

  return (
    <div className={classes.grow}>
      <NavigationBar />
      {loading && <LinearProgress />}
      <Grid container className={classes.content}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("Name")}</TableCell>
              <TableCell>{t("Email")}</TableCell>
              <TableCell>{t("Roles")}</TableCell>
              <TableCell align="center">{t("Actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user: User) => (
              <TableRow key={user.email}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.roles.join(", ")}</TableCell>
                <TableCell align="center">
                  <Button variant="outlined" color="secondary" size="small">
                    {t("Delete")}
                  </Button>
                  {!user.roles.includes("admin") && (
                    <Button
                      onClick={() => onMakeAdmin(user)}
                      style={{ marginLeft: 10 }}
                      variant="outlined"
                      size="small"
                    >
                      {t("Make Admin")}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
    </div>
  );
};

export default withStyles(styles)(UserManagement);
