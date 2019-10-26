import React, { useState, useRef } from 'react';
import { SpacyDocument, Type, SpacyEntity, SpacyToken } from '../apigen';
import { Popover, Snackbar } from '@material-ui/core';
import { MaybeString, MaybeSpacyEntity } from '../types/optionals';
import { MaybeCurrentToken, CurrentToken } from '../types/CurrentToken';
import { TokenDialog } from './TokenDialog';
import { TextNode } from './TextNode';

interface Props {
  readOnly?: boolean;
  spacyDocument: SpacyDocument;
  onUpdate?: (document: SpacyDocument) => void;
  entityTypes: { [key: string]: Type };
  smallText?: boolean;
}

const TokenizedEditor = ({ spacyDocument: spacyDocument, onUpdate, entityTypes, readOnly, smallText }: Props) => {
  const [error, setError] = useState<MaybeString>(null);
  const [currentToken, setCurrentToken] = useState<MaybeCurrentToken>(null);
  const currentTokenEl = useRef<HTMLSpanElement | null>(null);

  if (!readOnly && !onUpdate) {
    throw new Error('Widget needs an onUpdate callback in editor mode');
  }

  const onMouseUp = () => {
    if (!onUpdate || readOnly) return;
    var selection = window.getSelection();
    if (selection === null) {
      return;
    }
    const tokens = spacyDocument.tokens || [];
    if (selection.toString().length == 0) {
      return;
    }
    let range = selection.getRangeAt(0);
    let startContainer = range.startContainer;
    let endContainer = range.endContainer;
    if (startContainer.parentElement == null || endContainer.parentElement == null) {
      return; // Shouldn't happen
    }
    let startPosition = Number(startContainer.parentElement.id.split('-')[0]);
    let endPosition = Number(endContainer.parentElement.id.split('-')[1]);

    function overlapsSelection({ start, end }: SpacyEntity) {
      if (end < startPosition || start > endPosition) {
        return false;
      }
      return end < endPosition || start > startPosition;
    }

    let entities = spacyDocument.ents || [];
    if (entities.length > 0) {
      let hasOverlap = entities
        .map(entity => overlapsSelection(entity))
        .reduce((prev: boolean, curr: boolean) => prev || curr);
      if (hasOverlap) {
        selection.removeAllRanges();
        return;
      }
    }
    selection.removeAllRanges();
    const startToken = tokens.filter(it => it.start <= startPosition && it.end > startPosition)[0];
    const endToken = tokens.filter(it => it.start < endPosition && it.end >= endPosition)[0];
    const entity = { label: 'MISC', start: startToken.start, end: endToken.end };
    entities.push(entity);
    spacyDocument.ents = entities;
    onUpdate(spacyDocument);
    setCurrentToken({
      token: startToken,
      entity: entity || undefined,
    });
  };

  const onTokenClick = (token: SpacyToken, entity: MaybeSpacyEntity = null) => {
    if (!onUpdate) return;
    var entities = spacyDocument.ents || [];
    if (entity) {
      setCurrentToken({ token, entity });
      return;
    }
    entity = { label: 'MISC', end: token.end, start: token.start };
    entities.push(entity);
    spacyDocument.ents = entities;
    setCurrentToken({ token, entity });
    onUpdate(spacyDocument);
  };

  const findPreviousEntity = (currentToken: CurrentToken) => {
    if (!currentToken.entity || !spacyDocument.ents) return;

    const { start, end } = currentToken.token;
    const previousEntities = spacyDocument.ents.filter(entity => entity.start < start);

    if (previousEntities.length == 0) return undefined;

    var previousEntity: SpacyEntity = previousEntities[0];

    if (previousEntities.length == 1) return previousEntity;

    for (var i = 0; i < previousEntities.length; ++i) {
      const entity = spacyDocument.ents[i];
      if (entity.start == start && entity.end == end) continue;
      if (entity.end > previousEntity.end && entity.end <= start) {
        previousEntity = entity;
      }
    }
    return previousEntity;
  };

  const findNextEntity = (currentToken: CurrentToken) => {
    if (!currentToken.entity || !spacyDocument.ents) return;

    const { start, end } = currentToken.token;
    const nextEntities = spacyDocument.ents.filter(entity => entity.start > start);

    if (nextEntities.length == 0) return undefined;

    var previousEntity: SpacyEntity = nextEntities[0];

    if (nextEntities.length == 1) return previousEntity;

    for (var i = 0; i < nextEntities.length; ++i) {
      const entity = spacyDocument.ents[i];
      if (entity.start == start && entity.end == end) continue;
      if (entity.end < previousEntity.end && entity.start >= end) {
        previousEntity = entity;
      }
    }
    return previousEntity;
  };

  const onJoinLeft = () => {
    if (!onUpdate) return;
    if (!currentToken || !currentToken.entity || !spacyDocument.ents) return;
    const { start, end } = currentToken.token;
    spacyDocument.ents = spacyDocument.ents.filter(entity => entity.start != start && entity.end != end);
    var entityIndex = spacyDocument.ents.findIndex(entity => entity.start < start);
    var previousEntity: SpacyEntity = spacyDocument.ents[entityIndex];
    for (var i = 0; i < spacyDocument.ents.length; ++i) {
      const entity = spacyDocument.ents[i];
      if (entity.end > previousEntity.end && entity.end <= start) {
        previousEntity = entity;
        entityIndex = i;
      }
    }
    previousEntity.end = end;
    currentToken.entity = previousEntity;
    setCurrentToken({ ...currentToken });
    spacyDocument.ents[entityIndex] = previousEntity;
    setCurrentToken(null);
    onUpdate(spacyDocument);
  };
  const onJoinRight = () => {
    if (!onUpdate) return;
    if (!currentToken || !currentToken.entity || !spacyDocument.ents) return;
    const { start, end } = currentToken.token;
    spacyDocument.ents = spacyDocument.ents.filter(entity => entity.start != start && entity.end != end);
    var entityIndex = spacyDocument.ents.findIndex(entity => entity.start > start);
    var nextEntity: SpacyEntity = spacyDocument.ents[entityIndex];
    for (var i = 0; i < spacyDocument.ents.length; ++i) {
      const entity = spacyDocument.ents[i];
      if (entity.start < nextEntity.start && entity.start >= end) {
        nextEntity = entity;
        entityIndex = i;
      }
    }
    const idx = spacyDocument.ents.indexOf(currentToken.entity);
    if (idx > -1) {
      spacyDocument.ents.splice(idx, 1);
    }
    nextEntity.start = start;
    currentToken.entity = nextEntity;
    spacyDocument.ents[entityIndex] = nextEntity;
    setCurrentToken(null);
    onUpdate(spacyDocument);
  };
  const onDelete = () => {
    if (!onUpdate) return;
    if (!currentToken || !currentToken.entity || !spacyDocument.ents) return;
    const currentEntity = currentToken.entity;
    spacyDocument.ents = spacyDocument.ents.filter(entity => {
      return entity.start != currentEntity.start && entity.end != currentEntity.end;
    });
    onUpdate(spacyDocument);
    setCurrentToken(null);
  };
  const onTypeChange = (value: string) => {
    if (!onUpdate) return;
    if (currentToken && currentToken.entity) {
      currentToken.entity.label = value;
    }
    onUpdate(spacyDocument);
    setCurrentToken(null);
  };

  const previousEntity = currentToken && findPreviousEntity(currentToken);
  const nextEntity = currentToken && findNextEntity(currentToken);

  let popoverContents =
    currentToken && currentToken.entity ? (
      <TokenDialog
        typeOptions={entityTypes}
        onTypeChange={onTypeChange}
        onDelete={onDelete}
        value={currentToken.entity.label}
        onJoinLeft={previousEntity && onJoinLeft}
        onJoinRight={nextEntity && onJoinRight}
        previousEntityText={previousEntity && spacyDocument.text.substring(previousEntity.start, previousEntity.end)}
        nextEntityText={nextEntity && spacyDocument.text.substring(nextEntity.start, nextEntity.end)}
      />
    ) : (
      <div />
    );

  const isCurrentToken = (token: SpacyToken) => {
    return currentToken != null && currentToken.token.start == token.start && currentToken.token.end == token.end;
  };

  const mapNodes = (
    document: SpacyDocument,
    entityTypes: { [key: string]: Type },
    onTokenClick: ((token: SpacyToken) => void) | null,
  ) => {
    var entities = document.ents || [];

    const entityFor = (token: SpacyToken) => {
      for (const entity of entities) {
        if (entity.start <= token.start && entity.end >= token.end) {
          return entity;
        }
      }
      return null;
    };

    if (!document.tokens) return [];
    return document.tokens.map(token => {
      const text = document.text.substring(token.start, token.end);
      const nodeKey = `${token.start}-${token.end}`;
      const entity = entityFor(token) || undefined;
      const entityType = entity && entityTypes[entity.label];
      return (
        <TextNode
          ref={(isCurrentToken(token) && currentTokenEl) || null}
          entity={entity}
          entityType={entityType}
          key={nodeKey}
          text={text}
          token={token}
          onClick={!readOnly && onTokenClick}
          smallText={smallText}
        />
      );
    });
  };

  const onPopoverClose = () => {
    setCurrentToken(null);
  };

  return (
    <div>
      <div onMouseUp={onMouseUp} style={{ alignItems: 'center' }}>
        {mapNodes(spacyDocument, entityTypes, onTokenClick)}
      </div>
      <Popover
        id="entity-popover"
        open={currentToken != null}
        onClose={onPopoverClose}
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        anchorEl={() => currentTokenEl.current!}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        {popoverContents}
      </Popover>
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        open={error != null}
        autoHideDuration={1000}
        onClose={() => setError(null)}
        message={<span>{error}</span>}
      />
    </div>
  );
};

export { TokenizedEditor };
