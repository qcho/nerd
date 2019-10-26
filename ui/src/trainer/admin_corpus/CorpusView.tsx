import React, { useState } from 'react';
import { Scaffold } from '../scaffold/Scaffold';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/styles';
import { Theme, TableCell, Button, Paper, Link, Typography } from '@material-ui/core';
import { RichTable, DatasourceParameters } from '../rich_table/RichTable';
import { apiConfig } from '../helpers/api-config';
import { CorpusApi } from '../apigen';
import { Text } from '../apigen/api';
import { moment } from '../helpers/utils';
import { Title } from '../widgets/Title';
import Http from '../helpers/http';
import { SuccessSnackbar, ErrorSnackbar } from '../widgets/Snackbars';
import { FileUploadDialog } from './FileUploadDialog';
import { Link as RRDLink } from 'react-router-dom';
import { Routes } from '../helpers/routeHelper';

const useStyles = makeStyles(
  (theme: Theme) => ({
    content: {
      marginTop: theme.spacing.unit * 20,
      marginLeft: theme.spacing.unit * 10,
      marginRight: theme.spacing.unit * 10,
      padding: theme.spacing.unit * 2,
    },
  }),
  { withTheme: true },
);

const CorpusView = () => {
  const [t] = useTranslation();
  const classes = useStyles();
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [dropzoneOpen, setDropzoneOpen] = useState<boolean>(false);
  const api = new CorpusApi(apiConfig());

  const datasource = async (params: DatasourceParameters) => {
    return await api.getCorpus(params.page, params.pageSize);
  };

  const onDelete = async (rows: Text[]) => {
    setLoading(true);
    try {
      await Promise.all((rows.map(text => text.id) as (string)[]).map(id => api.removeCorpusText(id)));
      setSuccessMessage('Texts deleted');
    } catch (e) {
      setErrorMessage(
        Http.handleRequestError(e, (status, data) => {
          return t('There was an error while removing texts');
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const rowBuilder = (row: Text) => {
    return (
      <>
        <TableCell>{row.value}</TableCell>
        <TableCell>{moment(row.created_at).format('LLL')}</TableCell>
        <TableCell>
          <Link component={(props: any) => <RRDLink to={Routes.trainingsForText.buildRoute(row)} {...props} />}>
            {(row.trainings || []).length}
          </Link>
        </TableCell>
      </>
    );
  };

  const onDropzoneUpload = async (files: any[]) => {
    try {
      setDropzoneOpen(false);
      setLoading(true);
      for (let file of files) {
        await api.uploadFile(file);
      }
      window.location.reload();
    } catch (e) {
      setErrorMessage(
        Http.handleRequestError(e, (status, data) => {
          return t('There was a problem uploading the file');
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Scaffold title={t('Corpus')} loading={loading}>
      <Paper className={classes.content}>
        <Title>{t('Upload')}</Title>
        {!loading && (
          <Button color="primary" onClick={() => setDropzoneOpen(true)}>
            {t('Upload File')}
          </Button>
        )}
        {loading && <Typography>{t('Uploading')}</Typography>}
        <div style={{ paddingBottom: '1em' }} />
        <Title>{t('Texts')}</Title>
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
          paginatable
        />
      </Paper>
      <SuccessSnackbar message={successMessage} onClose={() => setSuccessMessage('')} />
      <ErrorSnackbar message={errorMessage} onClose={() => setErrorMessage('')} />
      <FileUploadDialog open={dropzoneOpen} onClose={() => setDropzoneOpen(false)} onSave={onDropzoneUpload} />
    </Scaffold>
  );
};

export { CorpusView };
