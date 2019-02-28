import React from "react";
import { Theme, createStyles, withStyles, Grid } from "@material-ui/core";
import NavigationBar from "../NavigationBar";

const styles = (theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1
    },
    content: {
        marginTop: theme.spacing.unit * 2
      },
  });

const UserManagement = ({ classes }: { classes: any }) => {
  return (
    <div className={classes.grow}>
      <NavigationBar />
      <Grid container className={classes.content}>

      </Grid>
    </div>
  );
};

export default withStyles(styles)(UserManagement);
