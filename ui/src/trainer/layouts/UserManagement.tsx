import React, { useEffect, useState } from "react";
import {
  Theme,
  createStyles,
  withStyles,
  Grid,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  TablePagination,
  TableFooter
} from "@material-ui/core";
import NavigationBar from "../NavigationBar";
import { useTranslation } from "react-i18next";
import nsps from "../helpers/i18n-namespaces";
import { UsersApi, User, RoleList, RolesApi } from "../apigen";
import { apiConfig } from "../helpers/api-config";
import { Pagination } from "../types/Pagination";
import { MaybePagination } from "../types/optionals";
import Http from "../helpers/http";
import UserRow from "../widgets/UserRow";
import usePagination from "../hooks/usePagination";

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
  const {
    page,
    total,
    pageSize,
    setPage,
    setPageSize,
    setFromHeaders,
    shouldPaginate
  } = usePagination();
  const [roles, setRoles] = useState<RoleList>({});
  const [t] = useTranslation(nsps.userManagement);
  const userApi = new UsersApi(apiConfig());
  const roleApi = new RolesApi(apiConfig());

  async function fetchUsers() {
    setLoading(true);
    try {
      const users = await userApi.listUsers(page, pageSize);
      const rolesResponse = await roleApi.listRoles();
      setFromHeaders(users.headers);
      setUsers(users.data);
      setRoles(rolesResponse.data);
    } catch (e) {
      // TODO: Set error
      const errorMessage = Http.handleRequestError(e, (status, data) => {
        console.log("Error loading users", data);
        return "";
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize]);

  function handleChangePage(event: any, page: number) {
    setPage(page + 1);
  }

  function handleChangeUsersPerPage(
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    setPageSize(+event.target.value);
  }

  async function onDelete(user: User) {
    userApi.deleteUser(user.email);
    fetchUsers();
  }

  async function onSave(user: User) {
    console.log("Updating ", user);
    userApi.updateUser(user.email, user).then(() => {
      fetchUsers();
    });
  }

  return (
    <div className={classes.grow}>
      <NavigationBar />
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
              <UserRow
                key={user.email}
                user={user}
                roles={roles}
                onDelete={onDelete}
                onSave={onSave}
              />
            ))}
          </TableBody>
          {shouldPaginate && (
            <TableFooter>
              <TableRow>
                <TablePagination
                  count={total}
                  page={page - 1}
                  rowsPerPageOptions={[20, 50, 100]}
                  rowsPerPage={pageSize}
                  onChangePage={handleChangePage}
                  onChangeRowsPerPage={handleChangeUsersPerPage}
                />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </Grid>
    </div>
  );
};

export default withStyles(styles)(UserManagement);
