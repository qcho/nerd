import React from 'react';
import { DatasourceParameters, RichTable } from '../widgets/RichTable';
import { useTranslation } from 'react-i18next';
import { SnapshotsApi, Snapshot } from '../apigen';
import { apiConfig } from '../helpers/api-config';
import { SnapshotRow } from '../widgets/SnapshotRow';
import { Title } from '../widgets/Title';
import { Paper } from '@material-ui/core';

const SnapshotSection = () => {
  const [t] = useTranslation();
  const api = new SnapshotsApi(apiConfig());
  const snapshotDatasource = async (params: DatasourceParameters) => {
    try {
      return await api.listCorpusSnapshots(params.page, params.pageSize);
    } catch (e) {}
  };

  const buildRow = (snapshot: Snapshot) => <SnapshotRow snapshot={snapshot} />;
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
      <Paper>
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
