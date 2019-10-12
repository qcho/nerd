import { useEffect, useState } from 'react';
import { WorkersApi } from '../apigen';
import { apiConfig } from '../helpers/api-config';
import { useTranslation } from 'react-i18next';
import Http from '../helpers/http';

const useAvailableWorkers = () => {
  const [availableSnapshots, setAvailableSnapshots] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [t] = useTranslation();

  useEffect(() => {
    async function loadWorkers() {
      const workerApi = new WorkersApi(apiConfig());
      try {
        const workers = (await workerApi.listWorkers()).data;
        let workerSet = new Set(workers.map(worker => worker.snapshot));
        setAvailableSnapshots(Array.from(workerSet.values()));
      } catch (e) {
        setError(
          Http.handleRequestError(e, (status, data) => {
            return t('Error while retrieving workers');
          }),
        );
      }
    }
    loadWorkers();
  }, [t]);

  return { availableSnapshots, error };
};

export { useAvailableWorkers };
