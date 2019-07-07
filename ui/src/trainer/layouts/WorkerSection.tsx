import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Title } from '../widgets/Title';
import { Paper, Typography, Button } from '@material-ui/core';
import { WorkersApi, SnapshotsApi, Worker } from '../apigen';
import AsyncSelect from 'react-select/async';
import { apiConfig } from '../helpers/api-config';
import Select from 'react-select';
import { SuccessSnackbar, WarningSnackbar, ErrorSnackbar } from '../widgets/Snackbars';
import Http from '../helpers/http';

const WorkerSection = () => {
  const [t] = useTranslation();
  const workerApi = new WorkersApi(apiConfig());
  const [fromSnapshot, setFromSnapshot] = useState<string>('');
  const [toSnapshot, setToSnapshot] = useState<string>('');
  const snapshotApi = new SnapshotsApi(apiConfig());
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [warningMessage, setWarningMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const loadOptions = async (inputValue: string) => {
    try {
      const snapshots = (await snapshotApi.listCorpusSnapshots(1, 100)).data;
      return snapshots
        .map(snapshot => {
          const value = `v${snapshot.id == 0 ? 'CURRENT' : snapshot.id}`;
          return { value: value, label: value };
        })
        .filter(value => value.value != fromSnapshot);
    } catch (e) {
      setWarningMessage(
        Http.handleRequestError(e, (status, data) => {
          return t('Error while retrieving snapshots');
        }),
      );
    } finally {
      // TODO
    }
  };

  useEffect(() => {
    async function loadWorkers() {
      try {
        setWorkers((await workerApi.listWorkers()).data);
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

  const onReassingWorker = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/camelcase
      const response = await workerApi.reassignWorker({ from_version: fromSnapshot, to_version: toSnapshot });
      if (response.status == 200) {
        setSuccessMessage(
          t('Reassignment from snapshot {{from}} to {{to}} sent to server.', { from: fromSnapshot, to: toSnapshot }),
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
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center' }}>
            <Typography style={{ marginRight: '1em' }}>{t('From')}</Typography>
            <div style={{ width: 160 }}>
              <Select
                isSearchable={false}
                onChange={(value: any, action: any) => setFromSnapshot(value.value)}
                options={Object.keys(
                  workers.reduce(
                    (result, item) => ({
                      ...result,
                      [item.snapshot]: 1,
                    }),
                    {},
                  ),
                ).map(snapshot => ({
                  value: snapshot,
                  label: snapshot,
                }))}
              />
            </div>
            <Typography style={{ marginLeft: '1em', marginRight: '1em' }}>{t('to')}</Typography>
            <div style={{ width: 160 }}>
              <AsyncSelect
                isSearchable={false}
                loadOptions={loadOptions}
                onChange={(value: any, action: any) => setToSnapshot(value.value)}
                cacheOptions={fromSnapshot}
                defaultOptions
              />
            </div>
            <div>
              <Button style={{ marginLeft: '1em' }} onClick={onReassingWorker}>
                {t('Apply')}
              </Button>
            </div>
          </div>
        )}
      </Paper>
      <SuccessSnackbar message={successMessage} onClose={() => window.location.reload()} />
      <ErrorSnackbar message={errorMessage} onClose={() => setErrorMessage('')} />
      <WarningSnackbar message={warningMessage} onClose={() => setWarningMessage('')} />
    </div>
  );
};

export { WorkerSection };
