import React from "react";
import { Tooltip, Chip } from "@material-ui/core";
import { Type, SpacyEntity } from "../apigen";

type EntityNodeProps = {
  text: string;
  entity: SpacyEntity;
  entityType: Type;
  typeCode: string;
  editable: boolean;
  onClick: (htmlTarget: HTMLElement, entity: SpacyEntity) => void;
  onDelete: (entity: SpacyEntity) => void;
};

const UntokenizedEntityNode = (props: EntityNodeProps) => {
  let {
    text,
    entity,
    entityType,
    typeCode,
    onClick,
    onDelete,
    editable
  } = props;
  return (
    <Tooltip
      title={entityType.label}
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
                <span>{typeCode}</span>
              </b>
            </h1>
          }
          onDelete={editable ? () => onDelete(entity) : undefined}
        />
      </span>
    </Tooltip>
  );
};

export default UntokenizedEntityNode;
