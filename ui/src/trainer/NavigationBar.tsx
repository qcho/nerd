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

const link = (to: string) => (props: any) => <Link to={to} {...props} />;

const NavigationBar = (props: any) => {
  const { classes, location } = props;
  const title = useRouteTitle(location);
  const [t] = useTranslation(nsps.authentication);
  const { loggedIn, logout, isAdmin } = useAuthentication();

  return (
    <AppBar position="static">
      <Toolbar>
        {location.pathname != "/" && (
          <IconButton
            component={link("/")}
            className={classes.homeButton}
            color="inherit"
          >
            <Home />
          </IconButton>
        )}
        <Typography variant="h6" color="inherit" className={classes.grow}>
          {title}
        </Typography>
        {isAdmin && (
          <Button color="inherit" component={link("/admin/users")}>
            {t("Users")}
          </Button>
        )}
        {isAdmin && (
          <Button color="inherit" component={link("/admin/corpus")}>
            {t("Corpus")}
          </Button>
        )}
        {isAdmin && (
          <span
            style={{
              borderRight: "1px solid rgba(255, 255, 255, 0.5)",
              paddingLeft: 1,
              marginLeft: "1em",
              marginRight: "1em",
              height: "2em"
            }}
          />
        )}
        {loggedIn ? (
          <Button color="inherit" onClick={logout}>
            {t("Logout")}
          </Button>
        ) : (
          <Button color="inherit" component={link("/login")}>
            {t("Login")}
          </Button>
        )}
        {!loggedIn && (
          <Button color="inherit" component={link("/register")}>
            {t("Register")}
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

// @ts-ignore
export default withRouter(withStyles(styles)(NavigationBar));
