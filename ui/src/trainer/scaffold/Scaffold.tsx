import React from 'react';
import { NavigationBar } from './NavigationBar';
import { makeStyles } from '@material-ui/styles';
import { Theme, LinearProgress } from '@material-ui/core';

interface Props {
  children: React.ReactNode;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  errorMessage?: string;
}

const useStyles = makeStyles(
  (theme: Theme) => ({
    grow: {
      flexGrow: 1,
    },
    content: {
      marginTop: '80px',
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
      <div style={{ position: 'absolute', width: '100%', top: 0 }}>
        <NavigationBar title={title} loading={loading} subtitle={subtitle} />
      </div>
      <div className={classes.content}>{children}</div>
    </div>
  );
};

export { Scaffold };
