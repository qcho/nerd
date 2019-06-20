import React, { useState } from 'react';
import { Scaffold } from '../widgets/Scaffold';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/styles';
import { Theme, Paper, TableCell, Button } from '@material-ui/core';
import { RichTable, DatasourceParameters } from '../widgets/RichTable';
import { apiConfig } from '../helpers/api-config';
import { CorpusApi } from '../apigen';
import { Text } from '../apigen/api';
import moment from 'moment';
import { Title } from '../widgets/Title';
import Http from '../helpers/http';
import { SuccessSnackbar, ErrorSnackbar } from '../widgets/Snackbars';
import { FileUploadDialog } from '../widgets/FileUploadDialog';

const useStyles = makeStyles(
  (theme: Theme) => ({
    content: {
      marginTop: theme.spacing.unit * 2,
      marginLeft: theme.spacing.unit * 10,
      marginRight: theme.spacing.unit * 10,
      padding: theme.spacing.unit * 2,
    },
  }),
  { withTheme: true },
);

const CorpusView = () => {
  const [t] = useTranslation();
  const classes = useStyles({});
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
          // TODO: Handle different http status codes
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
        <TableCell>{(row.trainings || []).length}</TableCell>
      </>
    );
  };

  const onDropzoneUpload = async (files: any[]) => {
    try {
      const result = await api.uploadFile(files[0]);
      setDropzoneOpen(false);
    } catch (e) {
      setErrorMessage(
        Http.handleRequestError(e, (status, data) => {
          return t('There was a problem uploading the file');
        }),
      );
    }
  };

  return (
    <Scaffold title={t('Corpus')} loading={loading}>
      <Title>{t('Upload')}</Title>
      <Button color="primary" onClick={() => setDropzoneOpen(true)}>
        {t('Upload File')}
      </Button>
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
      <SuccessSnackbar message={successMessage} onClose={() => setSuccessMessage('')} />
      <ErrorSnackbar message={errorMessage} onClose={() => setErrorMessage('')} />
      <FileUploadDialog open={dropzoneOpen} onClose={() => setDropzoneOpen(false)} onSave={onDropzoneUpload} />
    </Scaffold>
  );
};

export { CorpusView };
