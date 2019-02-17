import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { withStyles, Theme } from "@material-ui/core/styles";
import classNames from "classnames";
import { createStyles } from "@material-ui/core";
import { Route, Router, Switch, BrowserRouter, withRouter } from "react-router-dom";
import Home from "./layouts/Home";
import NavigationBar from "./NavigationBar";
import Preview from "./layouts/Preview";
import Login from "./layouts/Login";

let styles = (theme: Theme) =>
  createStyles({
    root: {},
    grow: {
      flexGrow: 1
    },
    content: {
      padding: theme.spacing.unit * 3
    },
    toolbar: theme.mixins.toolbar
  });

type Props = {
  classes: any;
};

const App = ({ classes }: Props) => {
  return (
    <BrowserRouter>
      <div className={classNames(classes.root, classes.grow)}>
        <CssBaseline />
        <NavigationBar />
        <main className={classNames(classes.content, classes.grow)}>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/preview" component={Preview} />
            <Route exact path="/login" component={Login} />
          </Switch>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default withStyles(styles)(App);
