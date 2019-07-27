import React from 'react';
import { Typography } from '@material-ui/core';

interface Props {
  children: React.ReactChildren | string;
  gutterBottom?: boolean;
}

const Title = ({ children, gutterBottom = true }: Props) => {
  return (
    <Typography component="h2" variant="h5" gutterBottom={gutterBottom}>
      {children}
    </Typography>
  );
};

const Subtitle = (props: any) => (
  <Typography variant="subtitle1" color="inherit">
    {props.children}
  </Typography>
);

export { Title, Subtitle };
