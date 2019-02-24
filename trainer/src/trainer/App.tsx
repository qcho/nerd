import React, { Suspense } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import Home from "./layouts/Home";
import Preview from "./layouts/Preview";
import Login from "./layouts/Login";
import Register from "./layouts/Register";
import Loading from "./widgets/Loading";
import FourOhFour from "./layouts/FourOhFour";
import ModelManagement from "./layouts/ModelManagement";
import useAuthentication from "./hooks/useAuthentication";

const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  }
});

const App = () => {
  const { loggedIn, isAdmin } = useAuthentication();
  return (
    <BrowserRouter>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Suspense fallback={<Loading />}>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/preview" component={Preview} />
            {!loggedIn && <Route exact path="/login" component={Login} />}
            {!loggedIn && <Route exact path="/register" component={Register} />}
            {isAdmin && (
              <Route exact path="/models" component={ModelManagement} />
            )}
            <Route component={FourOhFour} />
          </Switch>
        </Suspense>
      </MuiThemeProvider>
    </BrowserRouter>
  );
};

export default App;
