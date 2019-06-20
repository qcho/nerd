import { UserCredentials, TrainText, SpacyDocument, SpacyEntity, User, Snapshot, SnapshotInfo, Text } from '../apigen';
import { Pagination } from './Pagination';

export type MaybeUserCredentials = UserCredentials | null;
export type MaybePagination = Pagination | null;
export type MaybeTrainText = TrainText | null;
export type MaybeSpacyDocument = SpacyDocument | null;
export type MaybeSpacyEntity = SpacyEntity | null | undefined;
export type MaybeUser = User | null | undefined;
export type MaybeText = Text | null | undefined;
export type MaybeSnapshot = Snapshot | null | undefined;
export type MaybeSnapshotInfo = SnapshotInfo | null | undefined;
export type MaybeString = string | null;
