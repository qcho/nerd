import { SpacyEntity } from '../apigen';

export type MaybeCurrentEntity = {
  entity: SpacyEntity;
  element: any;
} | null;
