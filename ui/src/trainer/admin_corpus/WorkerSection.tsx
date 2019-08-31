import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Title } from '../widgets/Title';
import { Paper, Typography, Button, InputBase, MenuItem } from '@material-ui/core';
import { WorkersApi, SnapshotsApi, Worker } from '../apigen';
import { apiConfig } from '../helpers/api-config';
import Select from '@material-ui/core/Select';
import { SuccessSnackbar, WarningSnackbar, ErrorSnackbar } from '../widgets/Snackbars';
import Http from '../helpers/http';

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
      <Typography style={{ marginRight: '1em' }}>{t('From')}</Typography>
      <div style={{ width: 160 }}>
        <Select
          value={relocatableWorkers.length > 0 ? fromSnapshot : ''}
          input={<InputBase style={{ position: 'relative', width: 'auto', paddingLeft: '5px' }} />}
          onChange={event => {
            setFromSnapshot((event.target.value as unknown) as string);
          }}
        >
          {relocatableWorkers.map(value => (
            <MenuItem value={value} key={value}>
              {value}
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

const WorkerSection = () => {
  const [t] = useTranslation();
  const workerApi = new WorkersApi(apiConfig());
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [relocatableWorkers, setRelocatableWorkers] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [warningMessage, setWarningMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    async function loadWorkers() {
      try {
        const workers = (await workerApi.listWorkers()).data;
        setWorkers(workers);
        let workerSet = new Set(workers.map(worker => worker.snapshot));
        setRelocatableWorkers(Array.from(workerSet.values()));
      } catch (e) {
        setWarningMessage(
          Http.handleRequestError(e, (status, data) => {
            return t('Error while retrieving workers');
          }),
        );
      }
    }
    loadWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onReassingWorker = async (fromSnapshot: string, toSnapshot: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/camelcase
      const response = await workerApi.reassignWorker({ from_version: fromSnapshot, to_version: toSnapshot });
      if (response.status == 200) {
        setSuccessMessage(
          t('Reassignment from snapshot {{from}} to {{to}} requested.', { from: fromSnapshot, to: toSnapshot }),
        );
      }
    } catch (e) {
      setErrorMessage(
        Http.handleRequestError(e, (status, data) => {
          if (status == 403) {
            return t("Can't reassign last worker for current");
          }
          return data;
        }),
      );
    }
  };

  return (
    <div>
      <Title>{t('Reassign worker')}</Title>
      <Paper style={{ padding: '1em', marginTop: '1em', marginBottom: '1em', width: 500 }}>
        {workers.length == 0 && (
          <div>
            <Typography>{t('No available workers')}</Typography>
          </div>
        )}
        {workers.length > 0 && (
          <WorkerMigrate relocatableWorkers={relocatableWorkers} onRelocateWorker={onReassingWorker} />
        )}
      </Paper>
      <SuccessSnackbar message={successMessage} onClose={() => window.location.reload()} />
      <ErrorSnackbar message={errorMessage} onClose={() => setErrorMessage('')} />
      <WarningSnackbar message={warningMessage} onClose={() => setWarningMessage('')} />
    </div>
  );
};

export { WorkerSection };
