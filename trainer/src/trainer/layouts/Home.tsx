import React from "react";
import NavigationBar from "../NavigationBar";
import { Theme, createStyles, withStyles, Grid } from "@material-ui/core";
import classNames from "classnames";
import { Link } from "react-router-dom";
import useAuthentication from "../hooks/useAuthentication";

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
  return (
    <div className={classes.grow}>
      <NavigationBar />
      <div className={classNames(classes.content, classes.grow)}>
        <Link to="/preview">Find entities</Link>
        {isAdmin && <Link to="/models">Manage models</Link>}
      </div>
    </div>
  );
};

export default withStyles(styles)(Home);
