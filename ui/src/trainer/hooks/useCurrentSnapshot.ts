import { useState, useEffect } from 'react';
import { MaybeSnapshotInfo } from '../types/optionals';
import { SnapshotsApi } from '../apigen';
import { apiConfig } from '../helpers/api-config';
import Http from '../helpers/http';

export default function useCurrentSnapshot() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentSnapshot, setCurrentSnapshot] = useState<MaybeSnapshotInfo>(null);

  useEffect(() => {
    setLoading(true);
    async function fetchSnapshot() {
      const api = new SnapshotsApi(apiConfig());
      try {
        const result = await api.getCurrentSnapshot();
        setCurrentSnapshot(result.data);
      } catch (e) {
        setError(
          Http.handleRequestError(e, (status, data) => {
            return 'There was an error retrieving current snapshot';
          }),
        );
      } finally {
        setLoading(false);
      }
    }
    fetchSnapshot();
  }, []);

  return {
    loading,
    error,
    currentSnapshot,
  };
}
