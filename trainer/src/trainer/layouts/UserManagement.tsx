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

const styles = (theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1
    },
    content: {
      marginTop: theme.spacing.unit * 2
    }
  });

type User = {
  email: string;
  roles: string[];
  name: string;
};

const UserManagement = ({ classes }: { classes: any }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const userList = await UserApi.list();
      setUsers(userList);
    };
    fetchUsers().finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <div className={classes.grow}>
      <NavigationBar />
      {loading && <LinearProgress />}
      <Grid container className={classes.content}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell align="center">Actions</TableCell>
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
                    Delete
                  </Button>
                  {!user.roles.includes("admin") && (
                    <Button
                      style={{ marginLeft: 10 }}
                      variant="outlined"
                      size="small"
                    >
                      Make Admin
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
