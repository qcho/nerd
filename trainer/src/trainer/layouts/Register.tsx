import React, { useState } from "react";
import {
  Theme,
  createStyles,
  withStyles,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Input,
  Button
} from "@material-ui/core";
import { Auth } from "../helpers/auth";

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
    submit: {
      marginTop: theme.spacing.unit * 3
    },
    errorMessageContainer: {
      width: "100%",
      marginTop: theme.spacing.unit * 2
    },
    errorMessage: {
      color: theme.palette.error.main,
      textAlign: "center"
    },
  });

const Register = ({ classes }: { classes: any }) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const onInputChange = (setter: any) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setter(event.target.value);
  };

  const onFormSubmit = (event: React.FormEvent) => {
    setErrorMessage("");
    event.preventDefault();
    if (password != confirmPassword) {
      setErrorMessage("Passwords should match");
      return;
    }
    Auth.register(username, password);
  };
  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Typography component="h1" variant="h3">
          Register
        </Typography>
        <form className={classes.form} onSubmit={onFormSubmit}>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="email">Email Address</InputLabel>
            <Input
              id="email"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={onInputChange(setUsername)}
            />
          </FormControl>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="password">Password</InputLabel>
            <Input
              name="password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={onInputChange(setPassword)}
            />
          </FormControl>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="password">Confirm password</InputLabel>
            <Input
              name="confirmPassword"
              type="password"
              id="confirmPassword"
              autoComplete="current-password"
              onChange={onInputChange(setConfirmPassword)}
            />
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Register
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
