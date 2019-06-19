import React from 'react';
import { useNodeStyles } from './NodeStyles';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';

interface PlainNodeProps {
  text: string;
}

// const useStyles = makeStyles(
//   (theme: Theme) => ({
//     fontFamily: 'Roboto',
//   }),
//   { withTheme: true },
// );

const PlainNode = ({ text }: PlainNodeProps) => {
  const nodeStyles = useNodeStyles();

  return (
    <span className={nodeStyles.node} style={{ fontFamily: 'Roboto', fontSize: '2em' }}>
      {text}
    </span>
  );
};

export { PlainNode };
