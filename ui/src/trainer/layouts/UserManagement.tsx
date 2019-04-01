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
  TableFooter,
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
  const [pagination, setPagination] = useState<MaybePagination>(null);
  const [usersPerPage, setUsersPerPage] = useState<number>(20);
  const [page, setPage] = useState<number>(1);
  const [roles, setRoles] = useState<RoleList>({});
  const [t] = useTranslation(nsps.userManagement);
  const userApi = new UsersApi(apiConfig());
  const roleApi = new RolesApi(apiConfig());

  async function fetchUsers() {
    setLoading(true);
    try {
      const users = await userApi.listUsers(page, usersPerPage);
      const rolesResponse = await roleApi.listRoles();
      const paginationDetails: Pagination = JSON.parse(
        users.headers["x-pagination"]
      );
      setPagination(paginationDetails);
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
  }, [page, usersPerPage]);

  function handleChangePage(event: any, page: number) {
    setPage(page + 1);
  }

  function handleChangeUsersPerPage(
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    setUsersPerPage(+event.target.value);
  }

  async function onDelete(user: User) {
    userApi.deleteUser(user.email);
    fetchUsers();
  }

  async function onSave(user: User) {
    userApi.updateUser(user.email, user);
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
          {pagination && pagination.total_pages > 1 && (
            <TableFooter>
              <TableRow>
                <TablePagination
                  count={pagination.total}
                  page={pagination.page - 1}
                  rowsPerPageOptions={[20, 50, 100]}
                  rowsPerPage={usersPerPage}
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
