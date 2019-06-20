import React from 'react';
import { useNodeStyles } from './NodeStyles';
import classNames from 'classnames';

interface PlainNodeProps {
  text: string;
}

const PlainNode = ({ text }: PlainNodeProps) => {
  const nodeStyles = useNodeStyles();

  return (
    <span
      className={classNames(nodeStyles.node, nodeStyles.hoverBackground, nodeStyles.hoverCursor, nodeStyles.leftMargin)}
      style={{ fontFamily: 'Roboto', fontSize: '2em' }}
    >
      {text}
    </span>
  );
};

export { PlainNode };
