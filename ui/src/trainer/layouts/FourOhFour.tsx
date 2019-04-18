import React from "react";
import { Paper, Typography, Button } from "@material-ui/core";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh"
  }
}));

const HomeLink = (props: any) => <Link to="/" {...props} />;

const FourOhFour = () => {
  const [t] = useTranslation();
  const classes = useStyles();
  return (
    <Paper className={classes.root}>
      <Typography variant="h5">{t("Lost?")}</Typography>
      <Button color="primary" variant="outlined" component={HomeLink}>
        {t("Go home")}
      </Button>
    </Paper>
  );
};

export default FourOhFour;
