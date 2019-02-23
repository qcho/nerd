import React from "react";
import {
  Paper,
  Theme,
  createStyles,
  withStyles,
  CircularProgress,
  Typography
} from "@material-ui/core";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh"
    },
    text: {
      paddingTop: theme.spacing.unit
    }
  });

type Props = {
  classes: any;
};

const Loading = ({ classes }: Props) => {
  return (
    <div className={classes.root}>
      <CircularProgress />
      <Typography className={classes.text}>Loading</Typography>
    </div>
  );
};

export default withStyles(styles)(Loading);
