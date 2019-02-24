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
import { useTranslation } from "react-i18next";
import nsps from "../helpers/i18n-namespaces";

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
  const [t] = useTranslation(nsps.fourOhFour);
  return (
    <Paper className={classes.root}>
      <Typography variant="h5">{t("Lost?")}</Typography>
      <Button color="primary" variant="outlined" component={HomeLink}>
        {t("Go home")}
      </Button>
    </Paper>
  );
};

export default withStyles(styles)(FourOhFour);
