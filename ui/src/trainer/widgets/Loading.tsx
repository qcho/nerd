import React from "react";
import {
  Theme,
  createStyles,
  withStyles,
  CircularProgress
} from "@material-ui/core";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh"
    }
  });

type Props = {
  classes: any;
};

const Loading = ({ classes }: Props) => {
  return (
    <div className={classes.root}>
      <CircularProgress />
    </div>
  );
};

export default withStyles(styles)(Loading);
