import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { SpacyToken, SpacyEntity, Type } from '../apigen';
import { useNodeStyles } from './NodeStyles';
import classNames from 'classnames';

const borderStyle = '1px solid black';
const borderRadius = '20px';
const entityMargin = '2px';
const entityPadding = '10px';
const backgroundColor = '#F0F0F0';

const useEntityNodeStyles = makeStyles(() => ({
  borderComplete: {
    paddingLeft: entityPadding,
    paddingRight: entityPadding,
    marginLeft: entityMargin,
    marginRight: entityMargin,
    border: borderStyle,
    borderRadius: borderRadius,
    backgroundColor: backgroundColor,
  },
  borderStart: {
    paddingLeft: entityPadding,
    marginLeft: entityMargin,
    borderTop: borderStyle,
    borderBottom: borderStyle,
    borderLeft: borderStyle,
    borderTopLeftRadius: borderRadius,
    borderBottomLeftRadius: borderRadius,
    backgroundColor: backgroundColor,
  },
  borderMiddle: {
    borderTop: borderStyle,
    borderBottom: borderStyle,
    backgroundColor: backgroundColor,
  },
  borderEnd: {
    paddingRight: entityPadding,
    marginRight: entityMargin,
    borderTop: borderStyle,
    borderBottom: borderStyle,
    borderRight: borderStyle,
    borderTopRightRadius: borderRadius,
    borderBottomRightRadius: borderRadius,
    backgroundColor: backgroundColor,
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
  editable: boolean;
}

const EntityNode = ({ text, token, entity, entityType, editable }: EntityNodeProps) => {
  const nodeStyles = useNodeStyles();
  const entityNodeStyles = useEntityNodeStyles();
  var contents = text;
  const borderClassName = borderClass(token, entity, entityNodeStyles);

  return (
    <div
      style={{ fontFamily: 'Roboto', fontSize: '2em', display: 'inline-flex', alignItems: 'center' }}
      className={classNames(
        nodeStyles.node,
        editable ? nodeStyles.hoverCursor : nodeStyles.arrowCursor,
        borderClassName,
        entity.start == token.start ? nodeStyles.leftMargin : nodeStyles.leftPadding,
      )}
    >
      {token.start == entity.start && (
        <span
          style={{
            fontWeight: 'bold',
            paddingRight: '10px',
            color: entityType.color,
          }}
        >
          {entity.label}
        </span>
      )}
      <span>{contents}</span>
    </div>
  );
};

export { EntityNode };
