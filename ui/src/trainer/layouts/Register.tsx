import React, { useState, Suspense } from "react";
import {
  Theme,
  createStyles,
  withStyles,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Input,
  Button,
  Checkbox,
  FormControlLabel
} from "@material-ui/core";
import useAuthentication from "../hooks/useAuthentication";
import { useTranslation } from "react-i18next";
import nsps from "../helpers/i18n-namespaces";
import { Redirect } from "react-router-dom";
import authStyles from '../styles/auth'

const styles = (theme: Theme) =>
  createStyles({
    ...authStyles(theme)
  });

const Register = ({ classes }: { classes: any }) => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [t] = useTranslation(nsps.authentication);
  const { register, loggedIn } = useAuthentication();

  const onInputChange = (setter: any) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setter(event.target.value);
  };

  const onFormSubmit = (event: React.FormEvent) => {
    setErrorMessage("");
    event.preventDefault();
    if (password != confirmPassword) {
      setErrorMessage(t("Passwords should match"));
      return;
    }
    register(name, email, password, rememberMe).catch((e: Error) => {
      setErrorMessage(e.message);
    });
  };
  if (loggedIn) {
    return <Redirect to="/" />;
  }
  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Typography component="h1" variant="h3">
          {t("Register")}
        </Typography>
        <form className={classes.form} onSubmit={onFormSubmit}>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="name">{t("Full Name")}</InputLabel>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              autoFocus
              onChange={onInputChange(setName)}
            />
          </FormControl>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="email">{t("Email Address")}</InputLabel>
            <Input
              id="email"
              name="email"
              autoComplete="email"
              onChange={onInputChange(setEmail)}
            />
          </FormControl>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="password">{t("Password")}</InputLabel>
            <Input
              name="password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={onInputChange(setPassword)}
            />
          </FormControl>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="password">{t("Confirm Password")}</InputLabel>
            <Input
              name="confirmPassword"
              type="password"
              id="confirmPassword"
              autoComplete="current-password"
              onChange={onInputChange(setConfirmPassword)}
            />
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                value="remember"
                color="primary"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setRememberMe(event.target.checked)
                }
              />
            }
            label={t("Remember me")}
          />
          <Button type="submit" fullWidth variant="contained" color="primary">
            {t("Register")}
          </Button>
        </form>
        {errorMessage.length > 0 ? (
          <div className={classes.errorMessageContainer}>
            <Typography variant="subtitle2" className={classes.errorMessage}>
              {errorMessage}
            </Typography>
          </div>
        ) : null}
      </Paper>
    </div>
  );
};

export default withStyles(styles)(Register);
