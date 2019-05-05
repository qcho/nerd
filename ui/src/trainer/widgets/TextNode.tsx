import React from "react";
import { SpacyToken } from "../apigen";
import { useNodeStyles } from "./NodeStyles";

type TextNodeProps = {
  text: string;
  token: SpacyToken;
  onClick: ((target: HTMLElement, token: SpacyToken) => void) | null;
};

const TextNode = ({ text, token, onClick }: TextNodeProps) => {
  const nodeStyles = useNodeStyles();

  const _onClick = (target: any) => {
    if (onClick != null) {
      onClick(target, token);
    }
  };

  return (
    <span
      onClick={(event: any) => _onClick(event.target)}
      className={nodeStyles.node}
    >
      {text}
    </span>
  );
};

export { TextNode };
