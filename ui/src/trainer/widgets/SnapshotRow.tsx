/* eslint-disable @typescript-eslint/camelcase */
import React from 'react';
import { Snapshot } from '../apigen';
import { TableCell, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { moment, snapshotStatus, snapshotStatusToText } from '../helpers/utils';

interface Props {
  snapshot: Snapshot;
}

const SnapshotRow = ({ snapshot }: Props) => {
  const [t] = useTranslation();
  const { id, trained_at, semaphore, created_at } = snapshot;
  const name = id === 0 ? t('Current') : `${id}`;

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
        <Typography>{t(snapshotStatusToText(snapshotStatus(snapshot)))}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{'TODO'}</Typography>
      </TableCell>
    </>
  );
};

export { SnapshotRow };
