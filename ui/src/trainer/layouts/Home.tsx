import React from "react";
import NavigationBar from "../NavigationBar";
import {
  Theme,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  CardActions,
  Button
} from "@material-ui/core";
import classNames from "classnames";
import { Link } from "react-router-dom";
import useAuthentication from "../hooks/useAuthentication";
import { useTranslation } from "react-i18next";
import nsps from "../helpers/i18n-namespaces";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles(
  (theme: Theme) => ({
    grow: {
      flexGrow: 1
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

const onActionClick = (card: ApiService) => {};

const Home = () => {
  const { isAdmin, isUser } = useAuthentication();
  const [t] = useTranslation(nsps.home);
  const classes = useStyles();

  const services: ApiService[] = [
    {
      name: "Train",
      actionPath: "/train",
      action: "Go",
      description: t(
        "Help me become smarter! We'll show you a text with some tags and you can then decide if it's correct or fix them!"
      )
    },
    {
      name: "Find",
      actionPath: "/preview",
      action: "Go",
      description:
        "Want to try and see what we find for a given text? Then this is the way to go!"
    }
  ];

  return (
    <div className={classes.grow}>
      <NavigationBar />
      <Paper className={classes.content}>
        <Grid
          container
          spacing={40}
          alignItems="flex-end"
          className={classes.cardContainer}
        >
          {services.map(service => {
            return (
              <Grid item>
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
                      fullWidth
                      onClick={() => onActionClick(service)}
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
      </Paper>
      {/* <div className={classNames(classes.content, classes.grow)}>
        <Link to="/preview">{t("Find entities")}</Link>
        {isUser && <Link to="/train">{t("Train corpus")}</Link>}
        {isAdmin && <Link to="/admin/corpus">{t("Manage corpus")}</Link>}
        {isAdmin && <Link to="/admin/users">{t("Manage users")}</Link>}
      </div> */}
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
