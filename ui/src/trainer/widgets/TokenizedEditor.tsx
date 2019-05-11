import React, { useState, useRef } from 'react';
import { SpacyDocument, Type, SpacyEntity, SpacyToken } from '../apigen';
import { Popover, Snackbar } from '@material-ui/core';
import { MaybeString, MaybeSpacyEntity } from '../types/optionals';
import { MaybeCurrentToken } from '../types/CurrentToken';
import { TokenDialog } from './TokenDialog';
import { TextNode } from './TextNode';

interface Props {
  spacyDocument: SpacyDocument;
  onUpdate: (document: SpacyDocument) => void;
  entityTypes: { [key: string]: Type };
}

const TokenizedEditor = ({ spacyDocument: spacyDocument, onUpdate, entityTypes }: Props) => {
  const [error, setError] = useState<MaybeString>(null);
  const [currentToken, setCurrentToken] = useState<MaybeCurrentToken>(null);
  const currentTokenEl = useRef<HTMLSpanElement | null>(null);

  const onTokenClick = (token: SpacyToken, entity: MaybeSpacyEntity = null) => {
    var entities = spacyDocument.ents || [];
    if (!entity) {
      entity = { label: 'MISC', end: token.end, start: token.start };
      entities.push(entity);
      spacyDocument.ents = entities;
    }
    setCurrentToken({
      token,
      entity: entity || undefined,
    });
    onUpdate(spacyDocument);
  };

  const onJoinLeft = () => {
    const start = currentToken!.token.start;
    const end = currentToken!.token.end;
    var entityIndex = 0;
    var previousEntity: SpacyEntity = spacyDocument.ents![entityIndex]!;
    for (var i = 0; i < spacyDocument.ents!.length; ++i) {
      const entity = spacyDocument.ents![i]!;
      if (entity.end > previousEntity.end && entity.end < start) {
        previousEntity = entity;
        entityIndex = i;
      }
    }
    previousEntity.end = end;
    currentToken!.entity = previousEntity;
    setCurrentToken({ ...currentToken! });
    spacyDocument.ents![entityIndex] = previousEntity;
    setCurrentToken(null);
    onUpdate(spacyDocument);
  };
  const onJoinRight = () => {
    const start = currentToken!.token.start;
    const end = currentToken!.token.end;
    var entityIndex = 0;
    var nextEntity: SpacyEntity = spacyDocument.ents![entityIndex]!;
    for (var i = 0; i < spacyDocument.ents!.length; ++i) {
      const entity = spacyDocument.ents![i]!;
      if (entity.start < nextEntity.start && entity.start > end) {
        nextEntity = entity;
        entityIndex = i;
      }
    }
    const idx = spacyDocument.ents!.indexOf(currentToken!.entity!);
    if (idx > -1) {
      spacyDocument.ents!.splice(idx, 1);
    }
    nextEntity.start = start;
    currentToken!.entity = nextEntity;
    spacyDocument.ents![entityIndex] = nextEntity;
    setCurrentToken(null);
    onUpdate(spacyDocument);
  };
  const onDelete = () => {
    const currentEntity = currentToken!.entity!;
    spacyDocument.ents = spacyDocument.ents!.filter(entity => {
      return entity.start != currentEntity.start && entity.end != currentEntity.end;
    });
    onUpdate(spacyDocument);
    setCurrentToken(null);
  };
  const onRemove = () => {};
  const onTypeChange = (value: string) => {
    if (currentToken != null) {
      currentToken.entity!.label = value;
    }
    onUpdate(spacyDocument);
    setCurrentToken(null);
  };

  let popoverContents =
    currentToken != null ? (
      <TokenDialog
        typeOptions={entityTypes}
        onTypeChange={onTypeChange}
        onDelete={onDelete}
        value={currentToken.entity!.label}
        onJoinLeft={onJoinLeft}
        onJoinRight={onJoinRight}
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
    onTokenClick: ((target: HTMLElement, token: SpacyToken) => void) | null,
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

    return document.tokens!.map(token => {
      const text = document.text.substring(token.start, token.end);
      const nodeKey = `${token.start}-${token.end}`;
      const entity = entityFor(token) || undefined;
      const entityType = entity && entityTypes[entity.label];
      // console.log([token, currentToken, currentTokenEl, isCurrentToken(token)]);
      return (
        <TextNode
          ref={(isCurrentToken(token) && currentTokenEl) || null}
          entity={entity}
          entityType={entityType}
          key={nodeKey}
          text={text}
          token={token}
          onClick={onTokenClick}
        />
      );
    });
  };

  return (
    <div>
      <div>{mapNodes(spacyDocument, entityTypes, onTokenClick)}</div>
      <Popover
        id="entity-popover"
        open={currentToken != null}
        onClose={() => setCurrentToken(null)}
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

export default TokenizedEditor;
