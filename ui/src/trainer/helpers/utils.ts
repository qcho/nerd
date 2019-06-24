import moment from 'moment';
import { Snapshot } from '../apigen';

const isString = (x: any): x is string => typeof x === 'string';

const clone = (obj: any) => JSON.parse(JSON.stringify(obj));
const momenttz = (value: any) => {
  value = isString(value) ? value.replace('+00:00', '') : value;
  return moment(value);
};

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

function snapshotStatusToText(status: SnapshotStatus) {
  switch (status) {
    case SnapshotStatus.LOADING:
      return 'Loading from disk';
    case SnapshotStatus.READY:
      return 'Ready';
    case SnapshotStatus.UNKNOWN:
      return 'Unknown';
    case SnapshotStatus.TRAINING:
      return 'Training';
  }
}

export { clone, momenttz as moment, snapshotStatus, snapshotStatusToText, SnapshotStatus };
