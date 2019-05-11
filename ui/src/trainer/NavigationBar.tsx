import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Button, LinearProgress } from '@material-ui/core';
import { Link } from 'react-router-dom';
import useRouteTitle from './hooks/useRouteTitle';
import useAuthentication from './hooks/useAuthentication';
import { useTranslation } from 'react-i18next';
import Home from '@material-ui/icons/Home';
import useRouter from 'use-react-router';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(() => ({
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  grow: {
    flexGrow: 1,
  },
  homeButton: {
    marginLeft: -12,
    marginRight: 20,
  },
}));

const link = (to: string) =>
  function RouteLink(props: any) {
    return <Link to={to} {...props} />;
  };

interface NavigationBarProps {
  loading?: boolean;
}

const NavigationBar = ({ loading }: NavigationBarProps) => {
  const { location } = useRouter();
  const classes = useStyles();
  const title = useRouteTitle(location);
  const [t] = useTranslation();
  const { loggedIn, logout, isAdmin } = useAuthentication();

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {location.pathname != '/' && (
            <IconButton component={link('/')} className={classes.homeButton} color="inherit">
              <Home />
            </IconButton>
          )}
          <Typography variant="h6" color="inherit" className={classes.grow}>
            {title}
          </Typography>
          {isAdmin && (
            <>
              <Button color="inherit" component={link('/admin/users')}>
                {t('Users')}
              </Button>
              <Button color="inherit" component={link('/admin/corpus')}>
                {t('Corpus')}
              </Button>
              <span
                style={{
                  borderRight: '1px solid rgba(255, 255, 255, 0.5)',
                  paddingLeft: 1,
                  marginLeft: '1em',
                  marginRight: '1em',
                  height: '2em',
                }}
              />
            </>
          )}
          {loggedIn ? (
            <Button color="inherit" onClick={logout}>
              {t('Logout')}
            </Button>
          ) : (
            <>
              <Button color="inherit" component={link('/login')}>
                {t('Login')}
              </Button>
              <Button color="inherit" component={link('/register')}>
                {t('Register')}
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      {loading && <LinearProgress />}
    </>
  );
};

export default NavigationBar;
