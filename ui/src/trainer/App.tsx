import React, { Suspense } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import Home from './home/Home';
import Preview from './train/Preview';
import Login from './auth/Login';
import Register from './auth/Register';
import Loading from './widgets/Loading';
import FourOhFour from './FourOhFour';
import CorpusManagement from './admin_corpus/CorpusManagement';
import { useAuthentication } from './hooks/useAuthentication';
import UserManagement from './admin_user/UserManagement';
import { MyProfile } from './profile/MyProfile';
import { UserProfile } from './profile/UserProfile';
import { TextTrainings } from './admin_corpus/TextTrainings';
import { CorpusView } from './admin_corpus/CorpusView';
import Train from './train/Train';
import { Routes } from './helpers/routeHelper';
import { Role } from './types/role';
import { CompareSnapshots } from './compare/Compare';

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
});

const Navigation = () => {
  const { hasRole, loggedIn } = useAuthentication();
  const isAdmin = hasRole(Role.ADMIN);
  const isUser = hasRole(Role.USER);
  const isTrainer = hasRole(Role.TRAINER);
  return (
    <Switch>
      <Route exact path={Routes.home} component={Home} />
      {isUser && <Route exact path={Routes.preview} component={Preview} />}
      <Route exact path={Routes.login} component={Login} />
      <Route exact path={Routes.register} component={Register} />
      {loggedIn && <Route exact path={Routes.myProfile} component={MyProfile} />}
      {isAdmin && <Route exact path={Routes.corpusAdmin} component={CorpusManagement} />}
      {isAdmin && <Route exact path={Routes.userAdmin} component={UserManagement} />}
      {isAdmin && <Route exact path={Routes.userProfile.route} component={UserProfile} />}
      {isAdmin && <Route exact path={Routes.trainingsForText.route} component={TextTrainings} />}
      {isAdmin && <Route exact path={Routes.corpus} component={CorpusView} />}
      {isAdmin && <Route exact path={Routes.compare} component={CompareSnapshots} />}
      {isTrainer && <Route exact path={Routes.train} component={Train} />}
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
