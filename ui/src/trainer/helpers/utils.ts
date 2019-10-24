import moment from 'moment-timezone';
import 'moment/locale/es';
import { Snapshot } from '../apigen';

const isString = (x: any): x is string => typeof x === 'string';

moment.tz.setDefault('America/Argentina/Buenos_Aires');

const clone = (obj: any) => JSON.parse(JSON.stringify(obj));
enum SnapshotStatus {
  READY,
  LOADING,
  TRAINING,
  UNKNOWN,
}

function snapshotStatus(snapshot: Snapshot): SnapshotStatus {
  if (snapshot.semaphore === undefined) return SnapshotStatus.UNKNOWN;
  const sem = snapshot.semaphore;
  if (sem > 0) {
    return SnapshotStatus.LOADING;
  }
  if (sem < 0) {
    return SnapshotStatus.TRAINING;
  }
  return SnapshotStatus.READY;
}

function snapshotStatusToText(status: SnapshotStatus, t: any) {
  switch (status) {
    case SnapshotStatus.LOADING:
      return t('Loading');
    case SnapshotStatus.READY:
      return t('Ready');
    case SnapshotStatus.UNKNOWN:
      return t('Unknown');
    case SnapshotStatus.TRAINING:
      return t('Training');
  }
}

export { clone, moment, snapshotStatus, snapshotStatusToText, SnapshotStatus };
