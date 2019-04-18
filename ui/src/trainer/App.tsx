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
import CorpusManagement from "./layouts/CorpusManagement";
import useAuthentication from "./hooks/useAuthentication";
import UserManagement from "./layouts/UserManagement";
import Train from "./layouts/Train";

const theme = createMuiTheme({
  typography: {
    useNextVariants: true
  }
});

const Navigation = () => {
  const { isAdmin, isUser } = useAuthentication();
  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/preview" component={Preview} />
      <Route exact path="/login" component={Login} />
      <Route exact path="/register" component={Register} />
      {isAdmin && (
        <Route exact path="/admin/corpus" component={CorpusManagement} />
      )}
      {isAdmin && (
        <Route exact path="/admin/users" component={UserManagement} />
      )}
      {isUser && <Route exact path="/train" component={Train} />}
      <Route component={FourOhFour} />
    </Switch>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Suspense fallback={<Loading />}>
          <Navigation />
        </Suspense>
      </MuiThemeProvider>
    </BrowserRouter>
  );
};

export default App;
