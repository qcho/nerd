import React from "react";
import NavigationBar from "../NavigationBar";
import {
  Theme,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  CardActions,
  Button
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";
import useAuthentication from "../hooks/useAuthentication";

const useStyles = makeStyles(
  (theme: Theme) => ({
    grow: {
      flexGrow: 1
    },
    container: {
      marginTop: -theme.mixins.toolbar.minHeight!,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh"
    },
    content: {
      width: "auto",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: theme.spacing.unit * 3,
      marginRight: theme.spacing.unit * 3,
      [theme.breakpoints.up(900 + theme.spacing.unit * 3 * 2)]: {
        width: 900,
        marginLeft: "auto",
        marginRight: "auto"
      },
      marginTop: theme.spacing.unit * 4
    },
    cardContainer: {
      width: "auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginTop: theme.spacing.unit * 3,
      marginBottom: theme.spacing.unit * 3,
      marginLeft: theme.spacing.unit * 3,
      marginRight: theme.spacing.unit * 3
    },
    cardHeader: {
      backgroundColor: theme.palette.grey[200]
    },
    cardActions: {
      [theme.breakpoints.up("sm")]: {
        paddingBottom: theme.spacing.unit * 2
      }
    }
  }),
  { withTheme: true }
);

const Home = () => {
  const [t] = useTranslation();
  const classes = useStyles();
  const { loggedIn } = useAuthentication();

  const services: ApiService[] = [
    {
      name: "Train",
      actionPath: "/train",
      action: "Go",
      description: t(
        "Help me become smarter! I'll show you a text with some tags and you can then decide if it's correct or fix it!"
      )
    },
    {
      name: "Find",
      actionPath: "/preview",
      action: "Go",
      description:
        "Want to try and see what entities I find for a given text? Then this is the way to go!"
    }
  ];

  return (
    <div className={classes.grow}>
      <NavigationBar />
      <div className={classes.container}>
        <div className={classes.content}>
          {loggedIn ? (
            <Grid
              container
              spacing={40}
              alignItems="flex-end"
              className={classes.cardContainer}
            >
              {loggedIn &&
                services.map(service => {
                  return (
                    <Grid item key={service.name}>
                      <Card>
                        <CardHeader
                          title={service.name}
                          titleTypographyProps={{ align: "center" }}
                          className={classes.cardHeader}
                        />
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            align="center"
                            style={{ width: 350 }}
                          >
                            {service.description}
                          </Typography>
                        </CardContent>
                        <CardActions className={classes.cardActions}>
                          <Button
                            component={(props: any) => (
                              <Link to={service.actionPath} {...props} />
                            )}
                            fullWidth
                            variant="outlined"
                            color="primary"
                          >
                            {service.action}
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
            </Grid>
          ) : (
            <Grid
              container
              className={classes.cardContainer}
              style={{ marginTop: "-15em" }}
            >
              <Grid item>
                <Typography
                  component="h1"
                  variant="h2"
                  align="center"
                  color="textPrimary"
                  gutterBottom
                >
                  {t("Welcome")}
                </Typography>
                <Typography
                  variant="h6"
                  align="center"
                  color="textSecondary"
                  component="p"
                >
                  To continue please
                </Typography>
                <Grid
                  container
                  style={{ marginTop: "1em" }}
                  direction="row"
                  spacing={24}
                  alignContent="center"
                  alignItems="center"
                  justify="space-around"
                >
                  <Grid item>
                    <Button
                      component={(props: any) => (
                        <Link to={"/login"} {...props} />
                      )}
                      fullWidth
                      variant="outlined"
                      color="primary"
                    >
                      {t("Login")}
                    </Button>
                  </Grid>
                  <Grid item>
                    <Typography variant="subtitle1">or</Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      component={(props: any) => (
                        <Link to={"/register"} {...props} />
                      )}
                      fullWidth
                      variant="outlined"
                      color="primary"
                    >
                      {t("Register")}
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </div>
      </div>
    </div>
  );
};

type ApiService = {
  name: string;
  actionPath: string;
  action: string;
  description: any;
};

export default Home;
