import React, { Suspense } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import Home from './layouts/Home';
import Preview from './layouts/Preview';
import Login from './layouts/Login';
import Register from './layouts/Register';
import Loading from './widgets/Loading';
import FourOhFour from './layouts/FourOhFour';
import CorpusManagement from './layouts/CorpusManagement';
import useAuthentication from './hooks/useAuthentication';
import UserManagement from './layouts/UserManagement';
import { MyTrainings } from './layouts/MyTrainings';
import Train from './layouts/Train';
import { Routes } from './helpers/routeHelper';

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
});

const Navigation = () => {
  const { isAdmin, isUser } = useAuthentication();
  return (
    <Switch>
      <Route exact path={Routes.home} component={Home} />
      <Route exact path={Routes.preview} component={Preview} />
      <Route exact path={Routes.login} component={Login} />
      <Route exact path={Routes.register} component={Register} />
      <Route exact path={Routes.myTrainings} component={MyTrainings} />
      {isAdmin && <Route exact path={Routes.corpusAdmin} component={CorpusManagement} />}
      {isAdmin && <Route exact path={Routes.userAdmin} component={UserManagement} />}
      {isUser && <Route exact path={Routes.train} component={Train} />}
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
