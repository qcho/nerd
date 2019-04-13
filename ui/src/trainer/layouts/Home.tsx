import React from "react";
import NavigationBar from "../NavigationBar";
import { Theme } from "@material-ui/core";
import classNames from "classnames";
import { Link } from "react-router-dom";
import useAuthentication from "../hooks/useAuthentication";
import { useTranslation } from "react-i18next";
import nsps from "../helpers/i18n-namespaces";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme: Theme) => ({
  grow: {
    flexGrow: 1
  },
  content: {
    padding: theme.spacing.unit * 3,
    display: "flex",
    flexDirection: "column"
  }
}), { withTheme: true });

const Home = () => {
  const { isAdmin } = useAuthentication();
  const [t] = useTranslation(nsps.home);
  const classes = useStyles();
  return (
    <div className={classes.grow}>
      <NavigationBar />
      <div className={classNames(classes.content, classes.grow)}>
        <Link to="/preview">{t("Find entities")}</Link>
        {isAdmin && <Link to="/corpora">{t("Manage models")}</Link>}
        {isAdmin && <Link to="/users">{t("Manage users")}</Link>}
      </div>
    </div>
  );
};

export default Home;
