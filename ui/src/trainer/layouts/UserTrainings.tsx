import React, { useEffect, useState, useCallback } from 'react';
import { UsersApi, Training, SnapshotsApi, User, SnapshotInfo } from '../apigen';
import { apiConfig } from '../helpers/api-config';
import { DatasourceParameters, RichTable } from '../widgets/RichTable';
import Http from '../helpers/http';
import { Paper, Theme, CircularProgress, TableCell } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { MaybeUser, MaybeSnapshot } from '../types/optionals';
import { useTranslation } from 'react-i18next';
import TokenizedEditor from '../widgets/TokenizedEditor';
import { Scaffold } from '../widgets/Scaffold';

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

const UserTrainings = ({ match }: { match: any }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [user, setUser] = useState<MaybeUser>(null);
  const [snapshot, setSnapshot] = useState<MaybeSnapshot>(null);
  const [t] = useTranslation();

  const fetchUserAndSnapshot = useCallback(async () => {
    const { id } = match.params;
    const userApi = new UsersApi(apiConfig());
    const snapshotApi = new SnapshotsApi(apiConfig());
    try {
      setLoading(true);
      const [userResponse, snapshotResponse] = await Promise.all([
        userApi.userDetails(id),
        snapshotApi.getCurrentSnapshot(),
      ]);
      return [userResponse.data, snapshotResponse.data];
    } catch (e) {
      // TODO: Correct error message
      const errorMessage = Http.handleRequestError(e, (status, data) => {
        console.log('Error loading user', data);
        if (status === 404) {
          return t("User doesn't exist");
        }
        return t('Unknown error');
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [match.params, t]);

  useEffect(() => {
    async function loadUser() {
      const userAndSnapshot = await fetchUserAndSnapshot();
      if (!userAndSnapshot) return;
      const [user, snapshot] = userAndSnapshot;
      setUser(user as User);
      setSnapshot((snapshot as SnapshotInfo).snapshot);
    }
    loadUser();
  }, [fetchUserAndSnapshot]);

  const datasource = async (params: DatasourceParameters) => {
    try {
      const { id } = match.params;
      const userApi = new UsersApi(apiConfig());
      return await userApi.userTrainings(id, params.page, params.pageSize);
    } catch (e) {
      // TODO: Handle errors
      const errorMessage = Http.handleRequestError(e, (status, data) => {
        if (status === 404) {
          return t("User doesn't exist");
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
    // TODO
  };

  return (
    <Scaffold
      title={(user && t('{{userName}} trained texts', { userName: user.name })) || ''}
      loading={loading}
      errorMessage={error}
    >
      {!loading && error.length == 0 && user ? (
        <div className={classes.content}>
          <Paper>
            <RichTable
              headers={headers}
              valueToId={(value: Training) => value.id || ''}
              rowBuilder={buildRow}
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
    </Scaffold>
  );
};

export { UserTrainings };
