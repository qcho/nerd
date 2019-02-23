import React from "react";
import {
  LinearProgress,
  Paper,
  Theme,
  createStyles,
  withStyles
} from "@material-ui/core";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    }
  });

type Props = {
  classes: any;
};

const Loading = ({ classes }: Props) => {
  return (
    <Paper className={classes.root}>
      <LinearProgress />
    </Paper>
  );
};

export default withStyles(styles)(Loading);
