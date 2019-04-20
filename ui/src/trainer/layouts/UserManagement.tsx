import React, { useEffect, useState } from "react";
import {
  Theme,
  Grid,
  Table,
  TableRow,
  TableBody,
  TablePagination,
  TableFooter,
  Paper
} from "@material-ui/core";
import NavigationBar from "../NavigationBar";
import { useTranslation } from "react-i18next";
import { UsersApi, User, RoleList, RolesApi } from "../apigen";
import { apiConfig } from "../helpers/api-config";
import Http from "../helpers/http";
import UserRow from "../widgets/UserRow";
import usePagination from "../hooks/usePagination";
import { makeStyles } from "@material-ui/styles";
import RichTableHead from "../widgets/RichTableHead";
import xorSelected from "../helpers/xorSelected";
import TableToolbar from "../widgets/TableToolbar";

const useStyles = makeStyles(
  (theme: Theme) => ({
    grow: {
      flexGrow: 1
    },
    content: {
      marginTop: theme.spacing.unit * 2,
      marginLeft: theme.spacing.unit * 10,
      marginRight: theme.spacing.unit * 10
    }
  }),
  { withTheme: true }
);

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const classes = useStyles();
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
  const [t] = useTranslation();
  const [selected, setSelected] = useState<string[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const userApi = new UsersApi(apiConfig());
  const roleApi = new RolesApi(apiConfig());

  async function fetchUsers() {
    setLoading(true);
    try {
      const users = await userApi.listUsers(page, pageSize, searchText); // TODO: Add query
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
  }, [page, pageSize, searchText]);

  function handleChangePage(event: any, page: number) {
    setPage(page + 1);
  }

  function handleChangeUsersPerPage(
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) {
    setPageSize(+event.target.value);
  }

  const headers = [
    { id: "name", label: t("Name") },
    { id: "email", label: t("Email") },
    { id: "roles", label: t("Roles") }
  ];

  async function onDeleteClick() {
    const toDelete = users.filter(
      value => selected.indexOf(value.email) !== -1
    );
    try {
      setLoading(true);
      await Promise.all(toDelete.map(user => userApi.deleteUser(user.email)));
    } catch (e) {
      // TODO: Handle errors
    } finally {
      setLoading(false);
      setSelected([]);
      fetchUsers();
    }
  }

  function handleSelectAll(event: any) {
    if (event.target.checked) {
      setSelected(users.map(user => user.email));
    } else {
      setSelected([]);
    }
  }

  const isSelected = (id: string) => selected.indexOf(id) !== -1;
  const handleRowClick = (user: User) =>
    setSelected(xorSelected(selected, user.email));

  return (
    <div className={classes.grow}>
      <NavigationBar />
      <Paper className={classes.content}>
        <Grid container>
          <Grid item xs={12}>
            <TableToolbar
              onSearch={setSearchText}
              title={t("Users")}
              numSelected={selected.length}
              onDelete={onDeleteClick}
            />
          </Grid>

          <Table>
            <RichTableHead
              onSelectAll={handleSelectAll}
              headers={headers}
              numSelected={selected.length}
              rowCount={users.length}
            />
            <TableBody>
              {false &&
                users.map((user: User) => {
                  const rowSelected = isSelected(user.email);
                  return (
                    <UserRow
                      user={user}
                      selected={rowSelected}
                      onClick={handleRowClick}
                      availableRoles={roles}
                    />
                  );
                })}
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
      </Paper>
    </div>
  );
};

export default UserManagement;
