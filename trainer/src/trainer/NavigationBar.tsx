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
import { withRouter, Link } from "react-router-dom";
import useRouteTitle from "./hooks/useRouteTitle";
import useAuthentication from "./hooks/useAuthentication";
import { useTranslation } from "react-i18next";
import nsps from "./helpers/i18n-namespaces";
import Home from "@material-ui/icons/Home";

const styles = (theme: Theme) =>
  createStyles({
    menuButton: {
      marginLeft: -12,
      marginRight: 20
    },
    grow: {
      flexGrow: 1
    },
    homeButton: {
      marginLeft: -12,
      marginRight: 20
    }
  });

const LoginLink = (props: any) => <Link to="/login" {...props} />;
const RegisterLink = (props: any) => <Link to="/register" {...props} />;
const HomeLink = (props: any) => <Link to="/" {...props} />;

const NavigationBar = (props: any) => {
  const { classes, location } = props;
  const title = useRouteTitle(location);
  const [t] = useTranslation(nsps.authentication);
  const { loggedIn, logout } = useAuthentication();

  return (
    <AppBar position="static">
      <Toolbar>
        {location.pathname != "/" && (
          <IconButton
            component={HomeLink}
            className={classes.homeButton}
            color="inherit"
          >
            <Home />
          </IconButton>
        )}
        <Typography variant="h6" color="inherit" className={classes.grow}>
          {title}
        </Typography>
        {loggedIn ? (
          <Button color="inherit" onClick={logout}>
            {t("Logout")}
          </Button>
        ) : (
          <Button color="inherit" component={LoginLink}>
            {t("Login")}
          </Button>
        )}
        {!loggedIn && (
          <Button color="inherit" component={RegisterLink}>
            {t("Register")}
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

// @ts-ignore
export default withRouter(withStyles(styles)(NavigationBar));
