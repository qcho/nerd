import React from 'react';
import { useNodeStyles } from './NodeStyles';
import classNames from 'classnames';
import { SpacyToken } from '../apigen';

interface PlainNodeProps {
  text: string;
  token: SpacyToken;
  editable: boolean;
  smallText?: boolean;
}

const PlainNode = ({ text, token, editable, smallText }: PlainNodeProps) => {
  const nodeStyles = useNodeStyles();

  return (
    <span
      id={`${token.start}-${token.end}`}
      className={classNames(
        nodeStyles.node,
        editable && nodeStyles.hoverBackground,
        editable ? nodeStyles.hoverCursor : nodeStyles.arrowCursor,
        nodeStyles.leftMargin,
      )}
      style={{ fontFamily: 'Roboto', fontSize: smallText ? '1.5em' : '2em', paddingTop: '10px' }}
    >
      {text}
    </span>
  );
};

export { PlainNode };
