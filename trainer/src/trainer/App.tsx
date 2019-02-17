import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import Home from "./layouts/Home";
import Preview from "./layouts/Preview";
import Login from "./layouts/Login";
import Register from "./layouts/Register";

const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  }
});

const App = () => {
  return (
    <BrowserRouter>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/preview" component={Preview} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
        </Switch>
      </MuiThemeProvider>
    </BrowserRouter>
  );
};

export default App;