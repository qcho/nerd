import React, { useState, useEffect } from "react";
import NavigationBar from "../NavigationBar";
import { Theme, Grid, LinearProgress, Paper } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles(
  (theme: Theme) => ({
    grow: {
      flexGrow: 1,
      height: "100vh"
    },
    content: {
      marginTop: theme.spacing.unit * 4,
      marginLeft: theme.spacing.unit * 10,
      marginRight: theme.spacing.unit * 10
    }
  }),
  { withTheme: true }
);

const CorpusManagement = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const classes = useStyles();
  const [t] = useTranslation();

  useEffect(() => {
    // TODO: Load corpus metadata
  }, []);

  return (
    <div className={classes.grow}>
      <NavigationBar />
      {loading && <LinearProgress />}
      <Grid container className={classes.content}>
        {/* TODO */}
      </Grid>
    </div>
  );
};

export default CorpusManagement;
