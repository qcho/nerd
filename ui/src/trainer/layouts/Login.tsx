import React, { useState } from 'react';
import {
  createStyles,
  withStyles,
  Paper,
  Theme,
  Typography,
  Button,
  FormControl,
  FormControlLabel,
  Checkbox,
  InputLabel,
  Input,
} from '@material-ui/core';
import useAuthentication from '../hooks/useAuthentication';
import { Redirect } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authStyles from '../styles/auth';
import { ErrorMessage } from '../widgets/ErrorMessage';

const styles = (theme: Theme) =>
  createStyles({
    ...authStyles(theme),
    ...{
      submit: {
        marginTop: theme.spacing.unit * 3,
      },
    },
  });

const Login = ({ classes }: { classes: any }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [t] = useTranslation();
  const { login, loggedIn } = useAuthentication();

  const onInputChange = (setter: any) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setter(event.target.value);
  };

  const onCheckboxChange = (setter: any) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setter(event.target.checked);
  };

  const onFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    login(username, password, rememberMe).then(result => {
      const { success, message } = result;
      if (!success) {
        setErrorMessage(message);
      }
    });
  };

  return loggedIn ? (
    <Redirect to="/" />
  ) : (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Typography component="h1" variant="h3">
          {t('Login')}
        </Typography>
        <form className={classes.form} onSubmit={onFormSubmit}>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="email">{t('Email Address')}</InputLabel>
            <Input id="email" name="email" autoComplete="email" autoFocus onChange={onInputChange(setUsername)} />
          </FormControl>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="password">{t('Password')}</InputLabel>
            <Input
              name="password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={onInputChange(setPassword)}
            />
          </FormControl>
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" onChange={onCheckboxChange(setRememberMe)} />}
            label={t('Remember me')}
          />
          <Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit}>
            Login
          </Button>
        </form>
        {errorMessage && errorMessage.length > 0 && (
          <div className={classes.errorMessageContainer}>
            <ErrorMessage message={errorMessage} center />
          </div>
        )}
      </Paper>
    </div>
  );
};

// @ts-ignore
export default withStyles(styles)(Login);
