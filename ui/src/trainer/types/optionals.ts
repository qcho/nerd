import { UserCredentials, TrainText, SpacyDocument, SpacyEntity } from '../apigen';
import { Pagination } from './Pagination';

export type MaybeUserCredentials = UserCredentials | null;
export type MaybePagination = Pagination | null;
export type MaybeTrainText = TrainText | null;
export type MaybeSpacyDocument = SpacyDocument | null;
export type MaybeSpacyEntity = SpacyEntity | null | undefined;
export type MaybeString = string | null;
