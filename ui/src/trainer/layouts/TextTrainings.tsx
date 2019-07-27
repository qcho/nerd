import React, { useEffect, useState, useCallback } from 'react';
import { UsersApi, Training, SnapshotsApi, User, SnapshotInfo, TrainingsApi, CorpusApi, Text } from '../apigen';
import { apiConfig } from '../helpers/api-config';
import { DatasourceParameters, RichTable } from '../widgets/RichTable';
import Http from '../helpers/http';
import { Paper, Theme, CircularProgress, TableCell, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { MaybeSnapshot, MaybeText } from '../types/optionals';
import { useTranslation } from 'react-i18next';
import { TokenizedEditor } from '../widgets/TokenizedEditor';
import { Scaffold } from '../widgets/Scaffold';
import { Subtitle } from '../widgets/Title';

const useStyles = makeStyles(
  (theme: Theme) => ({
    content: {
      marginTop: theme.spacing.unit * 2,
      marginLeft: theme.spacing.unit * 5,
      marginRight: theme.spacing.unit * 5,
    },
  }),
  { withTheme: true },
);

const TextTrainings = ({ match }: { match: any }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [text, setText] = useState<MaybeText>(null);
  const [snapshot, setSnapshot] = useState<MaybeSnapshot>(null);
  const [t] = useTranslation();
  const corpusApi = new CorpusApi(apiConfig());

  useEffect(() => {
    const fetchTextAndSnapshot = async () => {
      const { id } = match.params;
      const snapshotApi = new SnapshotsApi(apiConfig());
      try {
        setLoading(true);
        const [textResponse, snapshotResponse] = await Promise.all([
          corpusApi.getCorpusText(id),
          snapshotApi.getCurrentSnapshot(),
        ]);
        return [textResponse.data, snapshotResponse.data];
      } catch (e) {
        // TODO: Correct error message
        const errorMessage = Http.handleRequestError(e, (status, data) => {
          console.log('Error loading text', data);
          if (status === 404) {
            return t("Text doesn't exist");
          }
          return t('Unknown error');
        });
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    async function loadText() {
      const textAndSnapshot = await fetchTextAndSnapshot();
      if (!textAndSnapshot) return;
      const [text, snapshot] = textAndSnapshot;
      setText(text as Text);
      setSnapshot((snapshot as SnapshotInfo).snapshot);
    }
    loadText();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const datasource = async (params: DatasourceParameters) => {
    try {
      const { id } = match.params;
      return await corpusApi.trainingsForText(id, params.page, params.pageSize);
    } catch (e) {
      // TODO: Handle errors
      const errorMessage = Http.handleRequestError(e, (status, data) => {
        if (status === 404) {
          return t("Text doesn't exist");
        }
        return t('Unknown error');
      });
      setError(errorMessage);
    }
  };

  const buildRow = (row: Training) => (
    <>
      <TableCell>
        <TokenizedEditor readOnly spacyDocument={row.document} entityTypes={(snapshot && snapshot.types) || {}} />
      </TableCell>
    </>
  );

  const headers = [
    {
      id: 'training',
      label: t('Trainings'),
    },
  ];

  const onDelete = async (rows: Training[]) => {
    const api = new TrainingsApi(apiConfig());
    try {
      setLoading(true);
      await Promise.all((rows.map(training => training.id) as (string)[]).map(id => api.deleteTraining(id)));
    } catch (e) {
      // TODO: Handle errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <Scaffold title={t('Trainings')} loading={loading} errorMessage={error}>
      {!loading && error.length == 0 && text ? (
        <div className={classes.content}>
          <Paper>
            {error.length == 0 && (
              <RichTable
                headers={headers}
                valueToId={(value: Training) => value.id || ''}
                rowBuilder={buildRow}
                datasource={datasource}
                onDelete={onDelete}
                paginatable
                emptyView={
                  <div style={{ padding: '2em' }}>
                    {/* TODO: Make a nice "empty" view */}
                    <Subtitle>{'There are no trainings here'}</Subtitle>
                  </div>
                }
              />
            )}
          </Paper>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </div>
      )}
    </Scaffold>
  );
};

export { TextTrainings };
