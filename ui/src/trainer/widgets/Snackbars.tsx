import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Snackbar, SnackbarContent, IconButton } from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import CloseIcon from '@material-ui/icons/Close';
import WarningIcon from '@material-ui/icons/Warning';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { green, amber } from '@material-ui/core/colors';

interface SnackbarProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

const useStyles = makeStyles(
  (theme: Theme) => ({
    error: {
      backgroundColor: theme.palette.error.dark,
    },
    success: {
      backgroundColor: green[600],
    },
    warning: {
      backgroundColor: amber[600],
    },
    message: {
      display: 'flex',
      alignItems: 'center',
    },
    icon: {
      fontSize: 20,
      opacity: 0.9,
      marginRight: theme.spacing.unit,
    },
  }),
  { withTheme: true },
);

type SnackbarVariant = 'success' | 'warning' | 'error';

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
};

const SnackbarBuilder = (variant: SnackbarVariant, showTime: number = 2000) => {
  return function FancySnack({ message, onClose, duration = showTime }: SnackbarProps) {
    const classes = useStyles();
    const Icon = variantIcon[variant];

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
          className={classes[variant]}
          message={
            <span className={classes.message}>
              <Icon className={classes.icon} />
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
};

const SuccessSnackbar = SnackbarBuilder('success');
const WarningSnackbar = SnackbarBuilder('warning', 5000);
const ErrorSnackbar = SnackbarBuilder('error');

export { ErrorSnackbar, SuccessSnackbar, WarningSnackbar };
