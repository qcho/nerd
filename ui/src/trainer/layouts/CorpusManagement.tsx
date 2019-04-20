import React, { useState, useEffect } from "react";
import NavigationBar from "../NavigationBar";
import {
  Theme,
  Grid,
  LinearProgress,
  Typography,
  Button
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";
import { Line } from "rc-progress";

const useStyles = makeStyles(
  (theme: Theme) => ({
    grow: {
      flexGrow: 1,
      height: "100vh"
    },
    content: {
      marginTop: theme.spacing.unit,
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit
    },
    cardHeader: {
      backgroundColor: theme.palette.grey[200]
    },
    versionLink: {
      ...theme.typography.h4,
      color: "fafafa",
      textDecoration: "none"
    },
    progressCircle: {
      fontFamily: theme.typography.body1.fontFamily
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

  const totalTexts = 1000;
  const trainedTexts = 1000;
  const percentageTrained = (trainedTexts / totalTexts) * 100;

  return (
    <div className={classes.grow}>
      <NavigationBar />
      {loading && <LinearProgress />}
      <Grid
        container
        className={classes.content}
        spacing={40}
        alignItems="flex-end"
      >
        <Grid item xs={8}>
          <Typography variant="h4" gutterBottom component="h2">
            {t("Information")}
          </Typography>
          <div
            style={{
              display: "flex",
              flexDirection: "column"
            }}
          >
            <Typography variant="h6">{t("Texts")}</Typography>
            <div style={{ paddingLeft: "1em" }}>
              <div
                style={{
                  width: "10em",
                  height: "1em",
                  verticalAlign: "top"
                }}
              >
                <Line
                  percent={percentageTrained}
                  strokeColor={progressColor(percentageTrained)}
                  strokeWidth={3}
                  trailWidth={3}
                />
              </div>
              <Typography variant="body1">
                {t("{{trained}} of {{total}} trained", {
                  total: totalTexts,
                  trained: trainedTexts
                })}
              </Typography>
              <Button
                style={{ marginTop: "1em" }}
                size="small"
                color="primary"
                variant="contained"
              >
                View all
              </Button>
            </div>
            <Typography style={{ marginTop: "1em" }} variant="h6">
              {t("Types")}
            </Typography>
            <div style={{ paddingLeft: "1em" }} />
          </div>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="h4" gutterBottom component="h2">
            {t("Versions")}
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
};

const progressColor = (percentage: number) => {
  if (percentage < 40) {
    return "#D2222D";
  }
  if (percentage < 70) {
    return "#FFBF00";
  }
  if (percentage < 100) {
    return "#0099E5";
  }
  return "#238823";
};

export default CorpusManagement;
