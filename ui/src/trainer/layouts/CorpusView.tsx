import React from 'react';
import { Scaffold } from '../widgets/Scaffold';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/styles';
import { Theme, Paper, TableCell } from '@material-ui/core';
import { RichTable, DatasourceParameters } from '../widgets/RichTable';
import { apiConfig } from '../helpers/api-config';
import { CorpusApi } from '../apigen';
import { Text } from '../apigen/api';
import moment from 'moment';

const useStyles = makeStyles(
  (theme: Theme) => ({
    content: {
      marginTop: theme.spacing.unit * 2,
      marginLeft: theme.spacing.unit * 10,
      marginRight: theme.spacing.unit * 10,
    },
  }),
  { withTheme: true },
);

const CorpusView = () => {
  const [t] = useTranslation();
  const classes = useStyles({});

  const datasource = async (params: DatasourceParameters) => {
    const api = new CorpusApi(apiConfig());
    return await api.getCorpus(params.page, params.pageSize);
  };

  const onDelete = async (rows: any[]) => {};

  const rowBuilder = (row: Text) => {
    console.log(row);
    return (
      <>
        <TableCell>{row.value}</TableCell>
        <TableCell>{moment(row.created_at).format('LLL')}</TableCell>
        <TableCell>{(row.trainings || []).length}</TableCell>
      </>
    );
  };

  return (
    <Scaffold title={t('Corpus')}>
      <Paper className={classes.content}>
        <RichTable
          headers={[
            {
              id: 'text',
              label: t('Text'),
            },
            {
              id: 'added',
              label: t('Added'),
            },
            {
              id: 'trainings',
              label: t('Trainings'),
            },
          ]}
          valueToId={(value: Text) => value.id || ''}
          datasource={datasource}
          rowBuilder={rowBuilder}
          onDelete={onDelete}
        />
      </Paper>
    </Scaffold>
  );
};

export { CorpusView };
