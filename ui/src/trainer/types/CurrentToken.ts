import { SpacyEntity, SpacyToken } from "../apigen";

export type CurrentToken = {
  token: SpacyToken;
  entity?: SpacyEntity;
  element: any;
};

export type MaybeCurrentToken = CurrentToken | null;
