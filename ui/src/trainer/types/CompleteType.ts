import { Type } from '../apigen';

export interface CompleteType {
  type: Type;
  code: string;
}

export type MaybeCompleteType = CompleteType | null;
