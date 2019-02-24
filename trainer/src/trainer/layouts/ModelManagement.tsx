import React from "react";
import NavigationBar from "../NavigationBar";
import { Theme, createStyles, withStyles, Grid } from "@material-ui/core";

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

const ModelManagement = ({ classes }: { classes: any }) => {
  return (
    <div className={classes.grow}>
      <NavigationBar />
      <span>Hello world</span>
    </div>
  );
};

export default withStyles(styles)(ModelManagement);
