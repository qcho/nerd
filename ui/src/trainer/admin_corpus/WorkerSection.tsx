import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Title } from '../widgets/Title';
import { Paper, Typography } from '@material-ui/core';
import { WorkersApi, Worker } from '../apigen';
import { apiConfig } from '../helpers/api-config';
import { SuccessSnackbar, WarningSnackbar, ErrorSnackbar } from '../widgets/Snackbars';
import { WorkerMigrate } from './WorkerMigrate';
import Http from '../helpers/http';

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
