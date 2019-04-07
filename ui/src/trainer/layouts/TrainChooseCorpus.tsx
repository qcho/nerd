import React, { useState } from "react";
import useReactRouter from "use-react-router";

import NavigationBar from "../NavigationBar";
import { LinearProgress, Theme, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles(
  (theme: Theme) => ({
    root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh"
    }
  }),
  { withTheme: true }
);

const TrainChooseModel = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { location } = useReactRouter();
  const classes = useStyles();
  // TODO: https://material-ui.com/demos/autocomplete/#react-select
  return (
    <div>
      <NavigationBar />
      {loading && <LinearProgress />}
      <div className={classes.root}>
        <div />
      </div>
    </div>
  );
};

export default TrainChooseModel;
