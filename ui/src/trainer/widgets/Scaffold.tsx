import React from 'react';
import { NavigationBar } from './NavigationBar';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';

interface Props {
  children: React.ReactNode;
  loading?: boolean;
  title?: string;
  subtitle?: string;
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

const Scaffold = ({ children, loading, title, subtitle }: Props) => {
  const classes = useStyles();
  return (
    <div className={classes.grow}>
      <NavigationBar title={title} loading={loading} subtitle={subtitle} />
      <div className={classes.content}>{children}</div>
    </div>
  );
};

export { Scaffold };
