import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Snackbar, SnackbarContent, IconButton } from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import CloseIcon from '@material-ui/icons/Close';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { green } from '@material-ui/core/colors';

interface SnackbarProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

const useStyles = makeStyles(
  (theme: Theme) => ({
    snackbarError: {
      backgroundColor: theme.palette.error.dark,
    },
    snackbarSuccess: {
      backgroundColor: green[600],
    },
    snackbarMessage: {
      display: 'flex',
      alignItems: 'center',
    },
    snackIcon: {
      fontSize: 20,
      opacity: 0.9,
      marginRight: theme.spacing.unit,
    },
  }),
  { withTheme: true },
);
const SuccessSnackbar = ({ message, onClose, duration = 2000 }: SnackbarProps) => {
  const classes = useStyles();

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open={message != ''}
      autoHideDuration={duration}
      onClose={onClose}
    >
      <SnackbarContent
        className={classes.snackbarSuccess}
        message={
          <span className={classes.snackbarMessage}>
            <CheckCircleIcon className={classes.snackIcon} />
            {message}
          </span>
        }
        action={[
          <IconButton key="close" aria-label="Close" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>,
        ]}
      />
    </Snackbar>
  );
};

const ErrorSnackbar = ({ message, onClose, duration = 5000 }: SnackbarProps) => {
  const classes = useStyles();

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open={message != ''}
      autoHideDuration={duration}
      onClose={onClose}
    >
      <SnackbarContent
        className={classes.snackbarError}
        message={
          <span className={classes.snackbarMessage}>
            <ErrorIcon className={classes.snackIcon} />
            {message}
          </span>
        }
        action={[
          <IconButton key="close" aria-label="Close" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>,
        ]}
      />
    </Snackbar>
  );
};

export { ErrorSnackbar, SuccessSnackbar };
