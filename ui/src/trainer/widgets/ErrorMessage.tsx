import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography } from '@material-ui/core';

const useStyles = makeStyles(
  (theme: Theme) => ({
    errorMessage: {
      color: theme.palette.error.main,
    },
  }),
  { withTheme: true },
);

const ErrorMessage = ({ message, center = false }: { message: string; center?: boolean }) => {
  const classes = useStyles();
  return (
    <Typography
      variant="subtitle2"
      className={classes.errorMessage}
      style={(center && { textAlign: 'center' }) || undefined}
    >
      {message}
    </Typography>
  );
};

export { ErrorMessage };
