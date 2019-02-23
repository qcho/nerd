import React from "react";
import {
  withStyles,
  createStyles,
  Theme,
  Paper,
  Typography,
  Button
} from "@material-ui/core";
import { Link } from "react-router-dom";

type Props = {
  classes: any;
};

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

const HomeLink = (props: any) => <Link to="/" {...props} />;

const FourOhFour = ({ classes }: Props) => {
  return (
    <Paper className={classes.root}>
      <Typography>Are you lost?</Typography>
      <Button color="inherit" component={HomeLink}>
        Go home
      </Button>
    </Paper>
  );
};

export default withStyles(styles)(FourOhFour);
