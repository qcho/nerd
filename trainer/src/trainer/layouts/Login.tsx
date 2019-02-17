import React, { useState } from "react";
import {
  Grid,
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
      width: "100%", // Fix IE 11 issue.
      marginTop: theme.spacing.unit
    }
  });

const doLogin = (username: string, password: string, rememberMe: boolean) => {
    // TODO: Finish this
    console.log("TODO");
};

const Login = ({ classes }: { classes: any }) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);

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

  const onSignInClick = () => {};

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Typography component="h1" variant="h3">
          Sign in
        </Typography>
        <form className={classes.form}>
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
          <FormControlLabel
            control={
              <Checkbox
                value="remember"
                color="primary"
                onChange={onCheckboxChange(setRememberMe)}
              />
            }
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={onSignInClick}
          >
            Sign in
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default withStyles(styles)(Login);
