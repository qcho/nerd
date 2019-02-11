import React from "react"
import { EntityType } from "../types/EntityType";
import EntityNode from "../widgets/EntityNode";
import TextNode from "../widgets/TextNode";
import { NerDocument } from "../types/NerDocument";

function textNodeProvider(
  document: NerDocument,
  entityTypes: EntityType[],
  onEntityClick: any,
  onEntityDelete: any
) {
  let out: any[] = [];
  let text = document.text;
  let entities = document.ents;
  let accumulatedText = "";
  let nodeIndex = 0;

  let textNodeBuilder = (index: number, text: string) => {
    return <TextNode key={`ner-${index}`} text={text} />;
  };

  function entityFor(index: number) {
    for (let idx = 0; idx < entities.length; ++idx) {
      let entity = entities[idx];
      if (entity.start <= index && entity.end >= index) {
        return entity;
      }
    }
    return null;
  }

  function entityTypeFor(code: string) {
    for (let i = 0; i < entityTypes.length; ++i) {
      let entityType = entityTypes[i];
      if (entityType.code == code) {
        return entityType;
      }
    }
    return null;
  }

  for (let idx = 0; idx < text.length; ++idx) {
    let entityForIndex = entityFor(idx);
    if (entityForIndex != null) {
      if (accumulatedText.length > 0) {
        let trimmedAndSplit = accumulatedText.trim().split(" ");
        let textNodes = trimmedAndSplit.map(text =>
          textNodeBuilder(nodeIndex++, text)
        );
        out.push(...textNodes);

        accumulatedText = "";
      }
      let entityText = text.substring(entityForIndex.start, entityForIndex.end);
      let entityType: EntityType = entityTypeFor(entityForIndex.label)!;
      out.push(
        <EntityNode
          key={`ner-${nodeIndex++}`}
          text={entityText}
          entity={entityForIndex}
          entityType={entityType}
          onDelete={onEntityDelete}
          onClick={onEntityClick}
        />
      );
      idx = entityForIndex.end;
    }
    if (idx < text.length) {
      accumulatedText += text[idx];
    }
  }
  if (accumulatedText.length > 0) {
    let textNodes = accumulatedText
      .trim()
      .split(" ")
      .map(text => textNodeBuilder(nodeIndex++, text));
    out.push(...textNodes);
  }
  return out;
}

export { textNodeProvider };
