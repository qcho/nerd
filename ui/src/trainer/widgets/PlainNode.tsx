import React from 'react';
import { useNodeStyles } from './NodeStyles';
import classNames from 'classnames';
import { SpacyToken } from '../apigen';

interface PlainNodeProps {
  text: string;
  token: SpacyToken;
}

const PlainNode = ({ text, token }: PlainNodeProps) => {
  const nodeStyles = useNodeStyles();

  return (
    <span
      id={`${token.start}-${token.end}`}
      className={classNames(nodeStyles.node, nodeStyles.hoverBackground, nodeStyles.hoverCursor, nodeStyles.leftMargin)}
      style={{ fontFamily: 'Roboto', fontSize: '2em' }}
    >
      {text}
    </span>
  );
};

export { PlainNode };
