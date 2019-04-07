import React from "react";
import NavigationBar from "../NavigationBar";
import { Theme, createStyles, withStyles, Grid } from "@material-ui/core";
import classNames from "classnames";
import { Link } from "react-router-dom";
import useAuthentication from "../hooks/useAuthentication";
import { useTranslation } from "react-i18next";

const styles = (theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1
    },
    content: {
      padding: theme.spacing.unit * 3,
      display: "flex",
      flexDirection: "column"
    }
  });

const Home = ({ classes }: { classes: any }) => {
  const { isAdmin } = useAuthentication();
  const [t] = useTranslation();
  return (
    <div className={classes.grow}>
      <NavigationBar />
      <div className={classNames(classes.content, classes.grow)}>
        <Link to="/preview">{t("Find entities")}</Link>
        {isAdmin && <Link to="/models">{t("Manage models")}</Link>}
        {isAdmin && <Link to="/users">{t("Manage users")}</Link>}
      </div>
    </div>
  );
};

export default withStyles(styles)(Home);
