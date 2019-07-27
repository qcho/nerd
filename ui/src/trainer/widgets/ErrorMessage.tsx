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

const ErrorMessage = ({ message, center = false, style }: { message: string; center?: boolean; style?: any }) => {
  const classes = useStyles();
  if (style && center) {
    style.textAlign = 'center';
  }
  return (
    <Typography variant="subtitle2" className={classes.errorMessage} style={style || undefined}>
      {message}
    </Typography>
  );
};

export { ErrorMessage };
