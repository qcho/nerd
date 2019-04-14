import React from "react";
import { Entity } from "../types/Entity";
import { Tooltip, Chip } from "@material-ui/core";
import { EntityType } from "../types/EntityType";

type EntityNodeProps = {
  text: string;
  entity: Entity;
  entityType: EntityType;
  editable: boolean;
  onClick: (htmlTarget: HTMLElement, entity: Entity) => void;
  onDelete: (entity: Entity) => void;
};

const EntityNode = (props: EntityNodeProps) => {
  let { text, entity, entityType, onClick, onDelete, editable } = props;
  return (
    <Tooltip
      title={entityType.name}
      style={{
        marginLeft: 2,
        marginRight: 2
      }}
    >
      <span
        onClick={
          editable
            ? (event: any) => onClick(event.currentTarget, entity)
            : undefined
        }
      >
        <Chip
          variant="outlined"
          label={
            <h1>
              <b>
                <span style={{ color: entityType.color }}>{text}</span>{" "}
                <span>{entityType.code}</span>
              </b>
            </h1>
          }
          onDelete={editable ? () => onDelete(entity) : undefined}
        />
      </span>
    </Tooltip>
  );
};

export default EntityNode;
