import React from 'react';
import { useTranslation } from 'react-i18next';
import { Title } from '../widgets/Title';
import { Paper } from '@material-ui/core';
import { RichTable } from '../widgets/RichTable';
import { WorkerRow } from '../widgets/WorkerRow';
import { WorkersApi, Worker } from '../apigen';
import { apiConfig } from '../helpers/api-config';

const WorkerSection = () => {
  const [t] = useTranslation();
  const api = new WorkersApi(apiConfig());

  const headers = [{ id: 'name', label: t('Name') }, { id: 'snapshot', label: t('Snapshot') }];

  return (
    <div>
      <Title>{t('Workers')}</Title>
      <Paper>
        <RichTable
          datasource={async () => await api.listWorkers()}
          rowBuilder={(worker: Worker) => <WorkerRow worker={worker} />}
          headers={headers}
          valueToId={(value: Worker) => `${value.name}`}
        />
      </Paper>
    </div>
  );
};

export { WorkerSection };
