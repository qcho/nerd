import React, { useState } from "react";
import { NerDocument } from "../types/NerDocument";
import { Entity } from "../types/Entity";
import { Popover, Theme, withStyles, Snackbar } from "@material-ui/core";
import EntityDialog from "./EntityDialog";
import useAuthentication from "../hooks/useAuthentication";
import { EntityType } from "../types/EntityType";

type Props = {
  classes: any;
  document: NerDocument;
  onUpdate: any;
  nodeProvider: any;
  entityTypes: EntityType[];
};

type MaybeCurrentEntity = {
  entity: Entity;
  element: any;
} | null;

type MaybeString = string | null;

const styles = (theme: Theme) => ({
  paper: {
    margin: theme.spacing.unit * 2
  }
});

function UntokenizedEditor({
  classes,
  document,
  onUpdate,
  nodeProvider,
  entityTypes
}: Props) {

  const [currentEntity, setCurrentEntity] = useState<MaybeCurrentEntity>(null);
  const [error, setError] = useState<MaybeString>(null);
  const entities = document.ents;

  function onEntityTypeChange(value: string) {
    currentEntity!.entity.label = value;
    setCurrentEntity(null);
  }

  function deleteEntity(entity: Entity) {
    let index = entities.findIndex(
      search => search.start == entity.start && search.end == entity.end
    );
    if (index < 0) {
      return; // Shouldn't happen
    }
    entities.splice(index, 1);
    onUpdate(document);
  }

  function onEntityClick(element: any, entity: Entity) {
    setCurrentEntity({
      element: element,
      entity: entity
    });
  }

  function onMouseUp() {
    var selection = window.getSelection();
    let text = selection.toString();
    if (!text || !text.length) {
      return;
    }

    let startPosition = document.text.indexOf(text);
    let endPosition = startPosition + text.length;

    function contains(entity: Entity, index: number) {
      return index >= entity.start && index <= entity.end;
    }

    if (document.ents.length > 0) {
      let isContainedInEntity = document.ents
        .map(
          entity =>
            contains(entity, startPosition) || contains(entity, endPosition)
        )
        .reduce((previous: boolean, current: boolean) => previous || current);

      let containsAnyEntity = false;

      document.ents.forEach((entity: Entity) => {
        containsAnyEntity =
          containsAnyEntity ||
          (startPosition <= entity.start && endPosition >= entity.end);
      });

      if (containsAnyEntity || isContainedInEntity) {
        window.getSelection().removeAllRanges();
        setError("Selection can't contain other entities");
        return;
      }
    }

    document.ents.push({
      start: startPosition,
      end: endPosition,
      label: "MISC"
    });
    window.getSelection().removeAllRanges();
    onUpdate(document);
  }

  let popoverOpen = currentEntity != null;
  let anchorElement = popoverOpen ? currentEntity!.element : null;
  let { loggedIn } = useAuthentication();
  let popoverContents = popoverOpen ? (
    <EntityDialog
      value={currentEntity!.entity.label}
      onTypeChange={(event: any) => onEntityTypeChange(event.target.value)}
      options={entityTypes}
    />
  ) : (
    <div />
  );

  return (
    <div>
      <div style={{ verticalAlign: "top" }} onMouseUp={onMouseUp}>
        {nodeProvider(
          document,
          entityTypes,
          onEntityClick,
          deleteEntity,
          loggedIn
        )}
      </div>
      <Popover
        id="entity-popover"
        open={popoverOpen}
        onClose={() => setCurrentEntity(null)}
        anchorEl={anchorElement}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center"
        }}
      >
        {popoverContents}
      </Popover>
      <Snackbar
        anchorOrigin={{
          vertical: "top",
          horizontal: "left"
        }}
        open={error != null}
        autoHideDuration={1000}
        onClose={() => setError(null)}
        message={<span>{error}</span>}
      />
    </div>
  );
}

export default withStyles(styles)(UntokenizedEditor);
