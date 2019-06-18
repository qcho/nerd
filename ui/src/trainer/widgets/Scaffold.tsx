import React from 'react';
import { NavigationBar } from './NavigationBar';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, Paper } from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';

interface Props {
  children: React.ReactNode;
  loading?: boolean;
  title?: string;
  errorMessage?: string;
}

const useStyles = makeStyles(
  (theme: Theme) => ({
    errorContainer: {
      backgroundColor: theme.palette.error.dark,
      height: '3em',
      margin: '0.2em',
      paddingLeft: '1em',
      display: 'flex',
      alignItems: 'center',
    },
    grow: {
      flexGrow: 1,
    },
    content: {
      marginTop: theme.spacing.unit * 2,
      marginLeft: theme.spacing.unit * 2,
      marginRight: theme.spacing.unit * 2,
    },
  }),
  { withTheme: true },
);

const ErrorContainer = ({ message }: { message: string }) => {
  const classes = useStyles();
  return (
    <Paper className={classes.errorContainer} style={{ color: 'white' }}>
      <ErrorIcon style={{ marginRight: '0.5em' }} />
      <Typography variant="subtitle1" color="inherit">
        {message}
      </Typography>
    </Paper>
  );
};

const Scaffold = ({ children, loading, title, errorMessage = '' }: Props) => {
  const classes = useStyles();
  const hasError = errorMessage.length > 0;
  return (
    <div className={classes.grow}>
      <NavigationBar title={title} loading={loading} />
      {hasError && <ErrorContainer message={errorMessage} />}
      {!hasError && <div className={classes.content}>{children}</div>}
    </div>
  );
};

export { Scaffold };
