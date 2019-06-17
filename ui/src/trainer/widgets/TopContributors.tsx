import React from 'react';
import { RichTable } from './RichTable';
import { useTranslation } from 'react-i18next';
import { UsersApi, TopContributor } from '../apigen';
import { TableCell, Typography } from '@material-ui/core';

const TopContributors = () => {
  const [t] = useTranslation();
  const headers = [{ id: 'name', label: t('Name') }, { id: 'trained', label: t('Trained') }];

  const buildRow = (data: TopContributor) => (
    <>
      <TableCell>{data.name}</TableCell>
      <TableCell>{data.total_trainings}</TableCell>
    </>
  );

  const datasource = async () => {
    const api = new UsersApi();
    try {
      const results = await api.top5();
      return {
        records: results.data,
      };
    } catch (e) {
      // TODO: Handle errors
    }
  };

  return (
    <RichTable
      headers={headers}
      datasource={datasource}
      valueToId={(value: TopContributor) => value.name}
      rowBuilder={buildRow}
      emptyView={
        <div>
          {/* TODO: Make a nice "empty" view */}
          <Typography>{'No one has contributed yet!'}</Typography>
        </div>
      }
    />
  );
};

export { TopContributors };
