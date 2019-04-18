import { Theme } from "@material-ui/core";

const authStyles: any = (theme: Theme) => ({
  root: {
    flexGrow: 1,
    height: "80vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
  }
});

export default authStyles;
