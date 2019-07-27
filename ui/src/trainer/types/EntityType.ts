import { Type } from '../apigen';

export interface EntityType {
  type: Type;
  code: string;
}

export type MaybeEntityType = EntityType | null;
