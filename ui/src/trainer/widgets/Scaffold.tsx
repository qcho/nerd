import React from 'react';
import { NavigationBar } from './NavigationBar';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';

interface Props {
  children: React.ReactNode;
  loading?: boolean;
  title?: string;
}

const useStyles = makeStyles(
  (theme: Theme) => ({
    grow: {
      flexGrow: 1,
    },
  }),
  { withTheme: true },
);

const Scaffold = ({ children, loading, title }: Props) => {
  const classes = useStyles();
  return (
    <div className={classes.grow}>
      <NavigationBar title={title} loading={loading} />
      {children}
    </div>
  );
};

export { Scaffold };
