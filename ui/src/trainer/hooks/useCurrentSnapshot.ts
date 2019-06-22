import { useState, useEffect } from 'react';
import { MaybeSnapshotInfo } from '../types/optionals';
import { SnapshotsApi, Snapshot } from '../apigen';
import { apiConfig } from '../helpers/api-config';
import Http from '../helpers/http';

export default function useCurrentSnapshot() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentSnapshot, setCurrentSnapshot] = useState<MaybeSnapshotInfo>(null);
  const api = new SnapshotsApi(apiConfig());

  useEffect(() => {
    setLoading(true);
    async function fetchSnapshot() {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createSnapshot() {
    if (!currentSnapshot) return;
    setLoading(true);
    try {
      await api.createCorpusSnapshot(currentSnapshot.snapshot);
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

  function updateCurrentSnapshot(snapshot: Snapshot) {
    if (!currentSnapshot) return;
    currentSnapshot.snapshot = snapshot;
    setCurrentSnapshot({ ...currentSnapshot });
  }

  return {
    loading,
    error,
    currentSnapshot,
    createSnapshot,
    updateCurrentSnapshot,
  };
}
