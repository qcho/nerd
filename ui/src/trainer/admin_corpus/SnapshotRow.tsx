/* eslint-disable @typescript-eslint/camelcase */
import React from 'react';
import { Snapshot, SnapshotsApi } from '../apigen';
import { TableCell, Typography, Grid, IconButton, Tooltip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import ArchiveIcon from '@material-ui/icons/Archive';
import UpdateIcon from '@material-ui/icons/Update';
import { moment, snapshotStatus, snapshotStatusToText, SnapshotStatus } from '../helpers/utils';
import { apiConfig } from '../helpers/api-config';

interface Props {
  snapshot: Snapshot;
  workers: { [key: string]: number };
}

const SnapshotRow = ({ snapshot, workers }: Props) => {
  const [t] = useTranslation();
  const { id, trained_at, created_at } = snapshot;
  const snapshotVersion = `v${snapshot.id == 0 ? 'CURRENT' : snapshot.id}`;
  const name = id === 0 ? t('Current') : `${id}`;
  const api = new SnapshotsApi(apiConfig());

  async function onUntrain() {
    await api.forceUntrain(id);
    window.location.reload();
  }
  async function onTrain() {
    await api.forceTrain(id);
    window.location.reload();
  }

  const status = snapshotStatus(snapshot);

  return (
    <>
      <TableCell>
        <Typography>{name}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{moment(created_at).format('LLL')}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{(trained_at && moment(trained_at).fromNow()) || t('Never')}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{snapshotStatusToText(status, t)}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{workers[snapshotVersion] || t('None')}</Typography>
      </TableCell>
      <TableCell>
        <Grid container alignContent="space-between">
          <Grid item>
            <Tooltip title={<Typography color="inherit">{t('Train')}</Typography>} placement="left">
              <div>
                <IconButton
                  aria-label={t('Train')}
                  onClick={onTrain}
                  color="primary"
                  disabled={status == SnapshotStatus.TRAINING}
                >
                  <UpdateIcon />
                </IconButton>
              </div>
            </Tooltip>
          </Grid>
          {trained_at && id > 0 && (
            <Grid item>
              <Tooltip title={<Typography color="inherit">{t('Untrain')}</Typography>} placement="right">
                <IconButton aria-label={t('Untrain')} onClick={onUntrain}>
                  <ArchiveIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          )}
        </Grid>
      </TableCell>
    </>
  );
};

export { SnapshotRow };
