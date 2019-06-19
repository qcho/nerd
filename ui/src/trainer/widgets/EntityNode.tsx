import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { SpacyToken, SpacyEntity, Type } from '../apigen';
import { useNodeStyles } from './NodeStyles';
import classNames from 'classnames';

const borderStyle = '1px solid black';
const borderRadius = '12px';
const entityMargin = '2px';
const entityPadding = '5px';

const useEntityNodeStyles = makeStyles(() => ({
  borderComplete: {
    paddingLeft: entityPadding,
    paddingRight: entityPadding,
    marginLeft: entityMargin,
    marginRight: entityMargin,
    border: borderStyle,
    borderRadius: borderRadius,
  },
  borderStart: {
    paddingLeft: entityPadding,
    marginLeft: entityMargin,
    borderTop: borderStyle,
    borderBottom: borderStyle,
    borderLeft: borderStyle,
    borderTopLeftRadius: borderRadius,
    borderBottomLeftRadius: borderRadius,
  },
  borderMiddle: {
    borderTop: borderStyle,
    borderBottom: borderStyle,
  },
  borderEnd: {
    paddingRight: entityPadding,
    marginRight: entityMargin,
    borderTop: borderStyle,
    borderBottom: borderStyle,
    borderRight: borderStyle,
    borderTopRightRadius: borderRadius,
    borderBottomRightRadius: borderRadius,
  },
}));

const borderClass = (
  token: SpacyToken,
  entity: SpacyEntity,
  styles: Record<'borderComplete' | 'borderStart' | 'borderMiddle' | 'borderEnd', string>,
) => {
  if (token.end == entity.end && token.start == entity.start) {
    return styles.borderComplete;
  }
  if (token.start == entity.start) {
    return styles.borderStart;
  }
  if (token.end == entity.end) {
    return styles.borderEnd;
  }
  return styles.borderMiddle;
};

interface EntityNodeProps {
  text: string;
  token: SpacyToken;
  entity: SpacyEntity;
  entityType: Type;
}

const EntityNode = ({ text, token, entity, entityType }: EntityNodeProps) => {
  const nodeStyles = useNodeStyles();
  const entityNodeStyles = useEntityNodeStyles();
  var contents = text;
  if (token.end == entity.end) {
    contents += ` ${entity.label}`;
  }
  const borderClassName = borderClass(token, entity, entityNodeStyles);

  return (
    <span
      style={{ color: entityType.color, fontFamily: 'Roboto', fontSize: '2em' }}
      className={classNames(nodeStyles.node, borderClassName)}
    >
      {contents}
    </span>
  );
};

export { EntityNode };
