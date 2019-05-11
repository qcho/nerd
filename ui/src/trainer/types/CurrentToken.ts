import { SpacyEntity, SpacyToken } from '../apigen';

export interface CurrentToken {
  token: SpacyToken;
  entity?: SpacyEntity;
}

export type MaybeCurrentToken = CurrentToken | null;
