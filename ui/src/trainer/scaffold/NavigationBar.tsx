import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Button, LinearProgress } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useAuthentication } from '../hooks/useAuthentication';
import { useTranslation } from 'react-i18next';
import Home from '@material-ui/icons/Home';
import useRouter from 'use-react-router';
import { makeStyles } from '@material-ui/styles';
import { Routes } from '../helpers/routeHelper';
import { Role } from '../types/role';
import { LanguageSelect } from './LanguageSelect';

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
  title?: string;
  subtitle?: string;
}

const Separator = () => {
  return (
    <span
      style={{
        borderRight: '1px solid rgba(255, 255, 255, 0.5)',
        paddingLeft: 1,
        marginLeft: '1em',
        marginRight: '1em',
        height: '2em',
      }}
    />
  );
};

const NavigationBar = ({ loading, title, subtitle }: NavigationBarProps) => {
  const { location } = useRouter();
  const classes = useStyles();
  const [t] = useTranslation();
  const { loggedIn, logout, hasRole } = useAuthentication();
  const isAdmin = hasRole(Role.ADMIN);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {location.pathname != '/' && (
            <IconButton component={link(Routes.home)} className={classes.homeButton} color="inherit">
              <Home />
            </IconButton>
          )}
          <div className={classes.grow}>
            <Typography variant="h6" color="inherit">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body1" color="inherit">
                {subtitle}
              </Typography>
            )}
          </div>
          {loggedIn && (
            <>
              <Button color="inherit" component={link(Routes.myProfile)}>
                {t('Profile')}
              </Button>
              <Separator />
            </>
          )}
          {isAdmin && (
            <>
              <Button color="inherit" component={link(Routes.userAdmin)}>
                {t('Users')}
              </Button>
              <Button color="inherit" component={link(Routes.corpus)}>
                {t('Corpus')}
              </Button>
              <Button color="inherit" component={link(Routes.corpusAdmin)}>
                {t('Status')}
              </Button>
              <Separator />
            </>
          )}
          <LanguageSelect />
          <Separator />
          {loggedIn ? (
            <Button color="inherit" onClick={logout}>
              {t('Logout')}
            </Button>
          ) : (
            <>
              <Button color="inherit" component={link(Routes.login)}>
                {t('Login')}
              </Button>
              <Button color="inherit" component={link(Routes.register)}>
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

export { NavigationBar };
