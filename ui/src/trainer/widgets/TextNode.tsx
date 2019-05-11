import React, { RefObject, Ref } from "react";
import { SpacyToken, SpacyEntity, Type } from "../apigen";
import { useNodeStyles } from "./NodeStyles";
import { EntityNode } from "./EntityNode";
import { PlainNode } from "./PlainNode";
import { MaybeSpacyEntity } from "../types/optionals";

type TextNodeProps = {
  text: string;
  token: SpacyToken;
  onClick:
    | ((
        target: HTMLElement,
        token: SpacyToken,
        entity: MaybeSpacyEntity
      ) => void)
    | null;
  entity?: SpacyEntity;
  entityType?: Type;
  ref: any;
};

const TextNode = React.forwardRef(
  (
    { text, token, onClick, entity, entityType }: TextNodeProps,
    ref: Ref<HTMLSpanElement>
  ) => {
    const nodeStyles = useNodeStyles();

    const _onClick = (target: any) => {
      if (onClick != null) {
        onClick(target, token, entity);
      }
    };

    var component =
      entity && entityType ? (
        <EntityNode {...{ text, token, entity, entityType }} />
      ) : (
        <PlainNode {...{ text }} />
      );

    return (
      <span ref={ref} onClick={(event: any) => _onClick(event.target)}>
        {component}
      </span>
    );
  }
);

export { TextNode };
