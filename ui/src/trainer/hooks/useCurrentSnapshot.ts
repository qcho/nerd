import { useState, useEffect } from 'react';
import { MaybeSnapshotInfo } from '../types/optionals';
import { SnapshotsApi, Snapshot } from '../apigen';
import { apiConfig } from '../helpers/api-config';
import Http from '../helpers/http';

export default function useCurrentSnapshot() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentSnapshot, setCurrentSnapshot] = useState<MaybeSnapshotInfo>(null);
  const [timer, setTimer] = useState<number | undefined>(undefined);
  const isRefreshing = timer !== undefined;

  const fetchSnapshot = async () => {
    const api = new SnapshotsApi(apiConfig());
    setLoading(true);
    setCurrentSnapshot(null);
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
  };

  useEffect(() => {
    fetchSnapshot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createSnapshot() {
    const api = new SnapshotsApi(apiConfig());
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

  function startRefresh() {
    if (isRefreshing) return;
    setCurrentSnapshot(null);
    fetchSnapshot();
    setTimer((setInterval(fetchSnapshot, 3000) as unknown) as number);
  }

  function endRefresh() {
    if (!isRefreshing) return;
    clearTimeout(timer);
    setTimer(undefined);
  }

  return {
    loading,
    error,
    currentSnapshot,
    createSnapshot,
    updateCurrentSnapshot,
    startRefresh,
    endRefresh,
    isRefreshing,
  };
}
