import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Theme,
  createStyles,
  withStyles
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { withRouter, Link } from "react-router-dom";
import useRouteTitle from "./hooks/useRouteTitle";
import useAuthentication from "./hooks/useAuthentication";

const styles = (theme: Theme) =>
  createStyles({
    menuButton: {
      marginLeft: -12,
      marginRight: 20
    },
    grow: {
      flexGrow: 1
    }
  });

const LoginLink = (props: any) => <Link to="/login" {...props} />;
const RegisterLink = (props: any) => <Link to="/register" {...props} />;

const NavigationBar = (props: any) => {
  const { classes, location } = props;
  const title = useRouteTitle(location);
  const {loggedIn, logout} = useAuthentication();

  return (
    <AppBar position="static">
      <Toolbar>
        {/* <IconButton
          className={classes.menuButton}
          color="inherit"
          aria-label="Menu"
        >
          <MenuIcon />
        </IconButton> */}
        <Typography variant="h6" color="inherit" className={classes.grow}>
          {title}
        </Typography>
        {loggedIn ? (
          <Button color="inherit" onClick={logout}>
          Logout
        </Button>
        ): (
          <Button color="inherit" component={LoginLink}>
          Login
        </Button>
        )}
        {!loggedIn ? (
          <Button color="inherit" component={RegisterLink}>
            Register
          </Button>
        ) : null}
      </Toolbar>
    </AppBar>
  );
};

// @ts-ignore
export default withRouter(withStyles(styles)(NavigationBar));
