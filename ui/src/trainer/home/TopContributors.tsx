import React from 'react';
import { RichTable } from '../rich_table/RichTable';
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
      return await api.top5();
    } catch (e) {
      console.error(e);
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
          <Typography>{t('No one has contributed yet!')}</Typography>
        </div>
      }
    />
  );
};

export { TopContributors };
