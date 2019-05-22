import React, { useEffect, useState, useCallback } from 'react';
import NavigationBar from '../NavigationBar';
import { UsersApi, TrainedText, SnapshotsApi, User, Snapshot } from '../apigen';
import { apiConfig } from '../helpers/api-config';
import { DatasourceParameters, RichTable } from '../widgets/RichTable';
import Http from '../helpers/http';
import { Paper, Theme, CircularProgress, TableCell, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { MaybeUser, MaybeSnapshot } from '../types/optionals';
import { useTranslation } from 'react-i18next';
import TokenizedEditor from '../widgets/TokenizedEditor';

const useStyles = makeStyles(
  (theme: Theme) => ({
    grow: {
      flexGrow: 1,
    },
    content: {
      marginTop: theme.spacing.unit * 2,
      marginLeft: theme.spacing.unit * 10,
      marginRight: theme.spacing.unit * 10,
    },
  }),
  { withTheme: true },
);

const UserTrainings = ({ match }: { match: any }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<MaybeUser>(null);
  const [snapshot, setSnapshot] = useState<MaybeSnapshot>(null);
  const [t] = useTranslation();
  console.log(match);

  const fetchUserAndSnapshot = useCallback(async () => {
    const { id } = match.params;
    const userApi = new UsersApi(apiConfig());
    const snapshotApi = new SnapshotsApi(apiConfig());
    try {
      const [userResponse, snapshotResponse] = await Promise.all([
        userApi.userDetails(id),
        snapshotApi.getCurrentSnapshot(),
      ]);
      return [userResponse.data, snapshotResponse.data];
    } catch (e) {
      // TODO: Correct error message
      const errorMessage = Http.handleRequestError(e, (status, data) => {
        console.log('Error loading user', data);
        return '';
      });
      setError(errorMessage);
    }
  }, [match.params]);

  useEffect(() => {
    async function loadUser() {
      const userAndSnapshot = await fetchUserAndSnapshot();
      if (!userAndSnapshot) return;
      const [user, snapshot] = userAndSnapshot;
      setUser(user as User);
      setSnapshot(snapshot as Snapshot);
    }
    loadUser();
  }, [fetchUserAndSnapshot]);

  const datasource = async (params: DatasourceParameters) => {
    try {
      const { id } = match.params;
      const userApi = new UsersApi(apiConfig());
      const results = await userApi.userTrainings(id, params.page, params.pageSize);
      return {
        records: results.data,
        headers: results.headers,
      };
    } catch (e) {
      // TODO: Handle errors
      const errorMessage = Http.handleRequestError(e, (status, data) => {
        console.log('Error loading users', data);
        return '';
      });
    }
  };

  const buildColumns = (row: TrainedText) => (
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

  const onDelete = async (rows: TrainedText[]) => {
    // TODO
  };

  return (
    <div>
      <NavigationBar title={(user && t('{{userName}} trained texts', { userName: user.name })) || ''} loading={false} />
      {!loading && user ? (
        <div className={classes.content}>
          <Paper>
            <RichTable
              headers={headers}
              valueToId={(value: TrainedText) => value.id || ''}
              columnBuilder={buildColumns}
              datasource={datasource}
              onDelete={onDelete}
              paginatable
            />
          </Paper>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

export { UserTrainings };
