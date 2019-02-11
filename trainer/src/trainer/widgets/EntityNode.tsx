import React from "react";
import { Entity } from "../types/Entity";
import { Tooltip, Chip } from "@material-ui/core";
import { EntityType } from "../types/EntityType";

type EntityNodeProps = {
  text: string;
  entity: Entity;
  entityType: EntityType;
  onClick: any;
  onDelete: any;
};

const EntityNode = (props: EntityNodeProps) => {
  let { text, entity, entityType, onClick, onDelete } = props;
  return (
    <Tooltip
      title={entityType.name}
      style={{
        marginLeft: 2,
        marginRight: 2
      }}
    >
      <span onClick={(event: any) => onClick(event.currentTarget, entity)}>
        <Chip
          variant="outlined"
          label={<b style={{ color: entityType.color }}>{text}</b>}
          onDelete={() => onDelete(entity)}
        />
      </span>
    </Tooltip>
  );
};

export default EntityNode;
