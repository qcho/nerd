import React from "react";
import NavigationBar from "../NavigationBar";
import { Theme, createStyles, withStyles } from "@material-ui/core";
import classNames from "classnames";
import { Link } from "react-router-dom";

const styles = (theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1
    },
    content: {
      padding: theme.spacing.unit * 3,
    }
  });

const Home = ({ classes }: { classes: any }) => {
  return (
    <div className={classes.grow}>
      <NavigationBar />
      <main className={classNames(classes.content, classes.grow)}>
        <Link to="/preview">Find entities</Link>
      </main>
    </div>
  );
};

export default withStyles(styles)(Home);
