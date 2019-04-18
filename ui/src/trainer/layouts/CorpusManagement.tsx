import React, { useState, useEffect } from "react";
import NavigationBar from "../NavigationBar";
import {
  Theme,
  Grid,
  LinearProgress,
  Paper,
  CardHeader,
  CardContent,
  Typography,
  Card
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";
import { Link } from "react-router-dom";

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
    },
    cardHeader: {
      backgroundColor: theme.palette.grey[200]
    },
    versionLink: {
      ...theme.typography.h4,
      color: "fafafa",
      textDecoration: "none"
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
      <Grid
        container
        className={classes.content}
        spacing={40}
        alignItems="flex-end"
      >
        <Grid item xs={8}>
          <Grid container spacing={24}>
            <Grid item>
              <Card style={{ width: 250 }}>
                <CardHeader
                  title="Versions"
                  titleTypographyProps={{ align: "center" }}
                  className={classes.cardHeader}
                />
                <CardContent>
                  <Typography variant="subtitle1" align="center">
                    <Link className={classes.versionLink} to="">
                      {10}
                    </Link>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item>
              <Card style={{ width: 250 }}>
                <CardHeader
                  title="Texts"
                  titleTypographyProps={{ align: "center" }}
                  className={classes.cardHeader}
                />
                <CardContent>
                  <Typography variant="subtitle1" align="center">
                    <Link className={classes.versionLink} to="">
                      {"60/100"}
                    </Link>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          xs={4}
          style={{ borderLeft: "1px solid rgba(0, 0, 0, 0.12)" }}
        />
      </Grid>
    </div>
  );
};

export default CorpusManagement;
