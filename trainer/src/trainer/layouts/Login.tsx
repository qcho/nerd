import React, { useState } from "react";
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
  Input
} from "@material-ui/core";
import useAuthentication from "../hooks/useAuthentication";
import { Redirect } from "react-router-dom";
import { useTranslation } from "react-i18next";
import nsps from "../helpers/i18n-namespaces";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      marginLeft: theme.spacing.unit * 3,
      marginRight: theme.spacing.unit * 3,
      [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
        width: 400,
        marginLeft: "auto",
        marginRight: "auto"
      }
    },
    paper: {
      marginTop: theme.spacing.unit * 8,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme
        .spacing.unit * 3}px`
    },
    form: {
      width: "100%",
      marginTop: theme.spacing.unit
    },
    errorMessageContainer: {
      width: "100%",
      marginTop: theme.spacing.unit * 2
    },
    errorMessage: {
      color: theme.palette.error.main,
      textAlign: "center"
    },
    submit: {
      marginTop: theme.spacing.unit * 3
    }
  });

const Login = ({ classes }: { classes: any }) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [t] = useTranslation(nsps.authentication);
  const { login, loggedIn } = useAuthentication();

  const onInputChange = (setter: any) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setter(event.target.value);
  };

  const onCheckboxChange = (setter: any) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
          {t("Login")}
        </Typography>
        <form className={classes.form} onSubmit={onFormSubmit}>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="email">{t("Email Address")}</InputLabel>
            <Input
              id="email"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={onInputChange(setUsername)}
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
          <FormControlLabel
            control={
              <Checkbox
                value="remember"
                color="primary"
                onChange={onCheckboxChange(setRememberMe)}
              />
            }
            label={t("Remember me")}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Login
          </Button>
        </form>
        {errorMessage && errorMessage.length > 0 && (
          <div className={classes.errorMessageContainer}>
            <Typography variant="subtitle2" className={classes.errorMessage}>
              {errorMessage}
            </Typography>
          </div>
        )}
      </Paper>
    </div>
  );
};

// @ts-ignore
export default withStyles(styles)(Login);
