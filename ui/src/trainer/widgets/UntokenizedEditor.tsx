import React, { useState } from "react";
import { Popover, Theme, Snackbar } from "@material-ui/core";
import EntityDialog from "./EntityDialog";
import useAuthentication from "../hooks/useAuthentication";
import { makeStyles } from "@material-ui/styles";
import EntityNode from "../widgets/EntityNode";
import TextNode from "../widgets/TextNode";
import { SpacyDocument, Type, SpacyEntity } from "../apigen";

function nodeProvider(
  document: SpacyDocument,
  entityTypes: { [key: string]: Type },
  onEntityClick: any,
  onEntityDelete: any,
  editable: boolean
) {
  let out: any[] = [];
  let text = document.text!;
  let entities = document.ents || [];
  let accumulatedText = "";
  let nodeIndex = 0;

  let textNodeBuilder = (index: number, text: string) => {
    return <TextNode key={`ner-${index}`} text={text == "" ? " " : text} />;
  };

  function entityFor(index: number) {
    for (let idx = 0; idx < entities!.length; ++idx) {
      let entity = entities![idx] as SpacyEntity;
      if (entity.start! <= index && entity.end! >= index) {
        return entity;
      }
    }
    return null;
  }

  function entityTypeFor(code: string) {
    if (code in entityTypes) {
      return entityTypes[code];
    }
    return null;
  }

  function buildTextNodes(text: string) {
    let textParts = text
      .split(" ")
      .flatMap((value, index, array) =>
        array.length - 1 !== index ? [value, " "] : value
      );
    return textParts.map(text => textNodeBuilder(nodeIndex++, text));
  }

  for (let idx = 0; idx < text.length; ++idx) {
    let entityForIndex = entityFor(idx);
    if (entityForIndex != null) {
      if (accumulatedText.length > 0) {
        out.push(...buildTextNodes(accumulatedText));

        accumulatedText = "";
      }
      let entityText = text.substring(entityForIndex.start, entityForIndex.end);
      let entityType: Type = entityTypeFor(entityForIndex.label)!;
      out.push(
        <EntityNode
          key={`ner-${nodeIndex++}`}
          text={entityText}
          entity={entityForIndex}
          entityType={entityType}
          typeCode={entityForIndex.label}
          onDelete={onEntityDelete}
          onClick={onEntityClick}
          editable={editable}
        />
      );
      idx = entityForIndex.end;
    }
    if (idx < text.length) {
      accumulatedText += text[idx];
    }
  }
  if (accumulatedText.length > 0) {
    out.push(...buildTextNodes(accumulatedText));
  }
  return out;
}

type Props = {
  document: SpacyDocument;
  onUpdate: (document: SpacyDocument) => void;
  entityTypes: { [key: string]: Type };
};

type MaybeCurrentEntity = {
  entity: SpacyEntity;
  element: any;
} | null;

type MaybeString = string | null;

const useStyles = makeStyles(
  (theme: Theme) => ({
    // TODO
  }),
  { withTheme: true }
);

export function UntokenizedEditor({ document, onUpdate, entityTypes }: Props) {
  const [currentEntity, setCurrentEntity] = useState<MaybeCurrentEntity>(null);
  const [error, setError] = useState<MaybeString>(null);
  const classes = useStyles();
  const entities = document.ents;

  function onEntityTypeChange(value: string) {
    if (currentEntity != null) {
      currentEntity.entity.label = value;
    }
    setCurrentEntity(null);
  }

  function deleteEntity(entity: SpacyEntity) {
    let index = entities!.findIndex(
      search => search.start == entity.start && search.end == entity.end
    );
    if (index < 0) {
      return; // Shouldn't happen
    }
    entities!.splice(index, 1);
    onUpdate(document);
  }

  function onEntityClick(element: any, entity: SpacyEntity) {
    setCurrentEntity({
      element: element,
      entity: entity
    });
  }

  function onMouseUp() {
    var selection = window.getSelection();
    if (selection === null) {
      return;
    }
    let text = selection.toString();
    if (!text || !text.length) {
      return;
    }

    let startPosition = document.text.indexOf(text);
    let endPosition = startPosition + text.length;

    function contains(entity: SpacyEntity, index: number) {
      return index >= entity.start && index <= entity.end;
    }

    if (document.ents!.length > 0) {
      let isContainedInEntity = document
        .ents!.map(
          entity =>
            contains(entity, startPosition) || contains(entity, endPosition)
        )
        .reduce((previous: boolean, current: boolean) => previous || current);

      let containsAnyEntity = false;

      document.ents!.forEach((entity: SpacyEntity) => {
        containsAnyEntity =
          containsAnyEntity ||
          (startPosition <= entity.start && endPosition >= entity.end);
      });

      if (containsAnyEntity || isContainedInEntity) {
        selection.removeAllRanges();
        setError("Selection can't contain other entities");
        return;
      }
    }

    document.ents!.push({
      start: startPosition,
      end: endPosition,
      label: "MISC"
    });
    selection.removeAllRanges();
    onUpdate(document);
  }

  let anchorElement = currentEntity != null ? currentEntity.element : null;
  let { loggedIn } = useAuthentication();
  let popoverContents =
    currentEntity != null ? (
      <EntityDialog
        value={currentEntity.entity.label}
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
        open={currentEntity != null}
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
