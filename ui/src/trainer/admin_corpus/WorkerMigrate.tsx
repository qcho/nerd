import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InputBase, MenuItem, Typography, Select } from '@material-ui/core';
import { SnapshotsApi } from '../apigen';
import { apiConfig } from '../helpers/api-config';

const WorkerMigrate = ({
  relocatableWorkers,
  onRelocateWorker,
}: {
  relocatableWorkers: string[];
  onRelocateWorker: (fromSnapshot: string, toSnapshot: string) => any;
}) => {
  const [t] = useTranslation();
  const [fromSnapshot, setFromSnapshot] = useState<string>('vCURRENT');
  const [toSnapshot, setToSnapshot] = useState<string>('vCURRENT');
  const [availableSnapshots, setAvailableSnapshots] = useState<string[]>([]);
  const [targetSnapshots, setTargetSnapshots] = useState<string[]>([]);

  useEffect(() => {
    async function loadAvailableSnapshots() {
      const snapshotApi = new SnapshotsApi(apiConfig());
      const snapshots = (await snapshotApi.listCorpusSnapshots(1, 100)).data;
      setAvailableSnapshots(
        snapshots.map(snapshot => {
          const value = `v${snapshot.id == 0 ? 'CURRENT' : snapshot.id}`;
          return value;
        }),
      );
    }
    loadAvailableSnapshots();
  }, []);

  useEffect(() => {
    const filteredSnapshots = availableSnapshots.filter(it => it != fromSnapshot);
    setTargetSnapshots(availableSnapshots.filter(it => it != fromSnapshot));
    setToSnapshot(filteredSnapshots.length > 0 ? filteredSnapshots[0] : '');
  }, [availableSnapshots, fromSnapshot]);
  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center' }}>
      <div style={{ width: 160 }}>
        <Select
          fullWidth
          style={{ display: 'block' }}
          value={relocatableWorkers.length > 0 ? fromSnapshot : ''}
          input={<InputBase style={{ position: 'relative', width: 'auto', paddingLeft: '5px' }} />}
          onChange={event => {
            setFromSnapshot((event.target.value as unknown) as string);
          }}
        >
          {relocatableWorkers.map(value => (
            <MenuItem value={value} key={value}>
              {value == 'vCURRENT' ? t('vCURRENT') : value}
            </MenuItem>
          ))}
        </Select>
      </div>
      <Typography style={{ marginLeft: '1em', marginRight: '1em' }}>{t('to')}</Typography>
      <div style={{ width: 160 }}>
        <Select
          displayEmpty
          value={toSnapshot}
          input={<InputBase style={{ position: 'relative', width: 'auto', paddingLeft: '5px' }} />}
          onChange={event => {
            setToSnapshot((event.target.value as unknown) as string);
          }}
        >
          {targetSnapshots.map(value => (
            <MenuItem value={value} key={value}>
              {value}
            </MenuItem>
          ))}
        </Select>
      </div>
      <div>
        <Button
          style={{ marginLeft: '1em' }}
          onClick={() => {
            onRelocateWorker(fromSnapshot, toSnapshot);
          }}
        >
          {t('Apply')}
        </Button>
      </div>
    </div>
  );
};

export { WorkerMigrate };
