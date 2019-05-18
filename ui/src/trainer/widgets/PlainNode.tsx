import React from 'react';
import { useNodeStyles } from './NodeStyles';

interface PlainNodeProps {
  text: string;
}

const PlainNode = ({ text }: PlainNodeProps) => {
  const nodeStyles = useNodeStyles();

  return <span className={nodeStyles.node}>{text}</span>;
};

export { PlainNode };