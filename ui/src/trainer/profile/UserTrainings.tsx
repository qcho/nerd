import React, { useState, useCallback, useEffect } from 'react';
import { DatasourceParameters, RichTable } from '../rich_table/RichTable';
import { useTranslation } from 'react-i18next';
import { MaybeSnapshot } from '../types/optionals';
import { SnapshotsApi, SnapshotInfo, UsersApi, User, Training, TrainingsApi } from '../apigen';
import { apiConfig } from '../helpers/api-config';
import Http from '../helpers/http';
import { TableCell, CircularProgress, Typography } from '@material-ui/core';
import { TokenizedEditor } from '../token_editor/TokenizedEditor';
import { useAuthentication } from '../hooks/useAuthentication';
import { Role } from '../types/role';

interface Props {
  user: User;
}

const UserTrainings = ({ user }: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [snapshot, setSnapshot] = useState<MaybeSnapshot>(null);
  const [error, setError] = useState<string>('');
  const { hasRole } = useAuthentication();
  const [t] = useTranslation();

  const fetchSnapshot = useCallback(async () => {
    const snapshotApi = new SnapshotsApi(apiConfig());
    try {
      setLoading(true);
      const snapshotResponse = await snapshotApi.getCurrentSnapshot();
      return snapshotResponse.data;
    } catch (e) {
      const errorMessage = Http.handleRequestError(e, (status, data) => {
        console.error('Error when getting snapshot', e);
        return t('Unknown error');
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    async function loadUser() {
      const snapshot = await fetchSnapshot();
      if (!snapshot) return;
      setSnapshot((snapshot as SnapshotInfo).snapshot);
    }
    loadUser();
  }, [fetchSnapshot]);

  const datasource = async (params: DatasourceParameters) => {
    try {
      const { id } = user;
      if (id === undefined) return;
      const userApi = new UsersApi(apiConfig());
      return await userApi.userTrainings(id, params.page, params.pageSize);
    } catch (e) {
      const errorMessage = Http.handleRequestError(e, (status, data) => {
        console.error(e);
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

  const onDelete = async (rows: Training[]) => {
    const api = new TrainingsApi(apiConfig());
    try {
      setLoading(true);
      await Promise.all((rows.map(training => training.id) as (string)[]).map(id => api.deleteTraining(id)));
    } catch (e) {
      console.error('Error when deleting training', e);
    } finally {
      setLoading(false);
    }
  };

  const headers = [
    {
      id: 'training',
      label: t('Trainings'),
    },
  ];

  return (
    <div>
      {!loading && error.length == 0 && snapshot ? (
        <div>
          <RichTable
            headers={headers}
            valueToId={(value: Training) => value.id || ''}
            rowBuilder={buildRow}
            datasource={datasource}
            onDelete={hasRole(Role.ADMIN) && onDelete}
            paginatable
            emptyView={<Typography variant="subtitle1">{t('No trainings yet')}</Typography>}
          />
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
