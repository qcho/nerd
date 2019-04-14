import { Range } from "./Range";
import { Token } from "./Token";
import { Entity } from "./Entity";

export type NerDocument = {
  text: string;
  ents: Entity[];
  sents: Range[];
  tokens: Token[];
};

export type MaybeNerDocument = null | NerDocument;
