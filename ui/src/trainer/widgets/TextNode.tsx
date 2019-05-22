import React, { Ref } from 'react';
import { SpacyToken, SpacyEntity, Type } from '../apigen';
import { EntityNode } from './EntityNode';
import { PlainNode } from './PlainNode';
import { MaybeSpacyEntity } from '../types/optionals';

interface TextNodeProps {
  text: string;
  token: SpacyToken;
  onClick: ((token: SpacyToken, entity: MaybeSpacyEntity) => void) | null | false;
  entity?: SpacyEntity;
  entityType?: Type;
}

// eslint-disable-next-line react/display-name
const TextNode = React.forwardRef(
  ({ text, token, onClick, entity, entityType }: TextNodeProps, ref: Ref<HTMLSpanElement>) => {
    const _onClick = () => {
      if (onClick) {
        onClick(token, entity);
      }
    };

    var component =
      entity && entityType ? <EntityNode {...{ text, token, entity, entityType }} /> : <PlainNode {...{ text }} />;

    return (
      <span ref={ref} onClick={() => _onClick()}>
        {component}
      </span>
    );
  },
);

export { TextNode };
