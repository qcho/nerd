import React from 'react';
import { Typography } from '@material-ui/core';

interface Props {
  children: React.ReactChildren;
}

const Title = ({ children }: Props) => {
  return (
    <Typography component="h2" variant="h5" gutterBottom>
      {children}
    </Typography>
  );
};

export { Title };
