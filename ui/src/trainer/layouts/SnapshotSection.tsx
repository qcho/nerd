import React, { useEffect, useState } from 'react';
import { DatasourceParameters, RichTable } from '../widgets/RichTable';
import { useTranslation } from 'react-i18next';
import { SnapshotsApi, Snapshot, WorkersApi, Worker } from '../apigen';
import { apiConfig } from '../helpers/api-config';
import { SnapshotRow } from '../widgets/SnapshotRow';
import { Title } from '../widgets/Title';
import { Paper } from '@material-ui/core';

const SnapshotSection = () => {
  const [t] = useTranslation();
  const api = new SnapshotsApi(apiConfig());
  const [workers, setWorkers] = useState<{ [key: string]: number }>({});
  const snapshotDatasource = async (params: DatasourceParameters) => {
    try {
      return await api.listCorpusSnapshots(params.page, params.pageSize);
    } catch (e) {}
  };

  useEffect(() => {
    const workerApi = new WorkersApi(apiConfig());
    async function loadWorkers() {
      try {
        const workers = (await workerApi.listWorkers()).data;
        setWorkers(
          workers.reduce<{ [key: string]: number }>(
            (result, item) => ({
              ...result,
              [item.snapshot]: (result[item.snapshot] || 0) + 1,
            }),
            {},
          ),
        );
      } catch (e) {
        // TODO: Error management
      }
    }
    loadWorkers();
  }, []);

  const buildRow = (snapshot: Snapshot) => <SnapshotRow snapshot={snapshot} workers={workers} />;
  const headers = [
    {
      id: 'version',
      label: t('Version'),
    },
    {
      id: 'created',
      label: t('Created On'),
    },
    {
      id: 'lastTrained',
      label: t('Last Trained'),
    },
    {
      id: 'status',
      label: t('Status'),
    },
    {
      id: 'workers',
      label: t('Workers'),
    },
    {
      id: 'actions',
      label: t('Actions'),
    },
  ];

  const onDelete = async (rows: any[]) => {
    try {
      await Promise.all(rows.map((snapshot: Snapshot) => api.deleteSnapshot(snapshot.id)));
    } catch (e) {
      // TODO: Handle error
    }
  };

  return (
    <div>
      <Title>{t('Snapshots')}</Title>
      <Paper style={{ padding: '1em', marginTop: '1em', marginBottom: '1em' }}>
        <RichTable
          datasource={snapshotDatasource}
          rowBuilder={buildRow}
          headers={headers}
          valueToId={(value: Snapshot) => `${value.id}`}
          onDelete={onDelete}
        />
      </Paper>
    </div>
  );
};

export { SnapshotSection };
