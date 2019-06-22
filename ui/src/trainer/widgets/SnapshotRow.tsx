/* eslint-disable @typescript-eslint/camelcase */
import React from 'react';
import { Snapshot } from '../apigen';
import { TableCell, Tab, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

interface Props {
  snapshot: Snapshot;
}

const SnapshotRow = ({ snapshot }: Props) => {
  const [t] = useTranslation();
  const { id, trained_at, semaphore, created_at } = snapshot;
  const name = id === 0 ? t('Current') : `${id}`;

  const statusFromSemaphore = (semaphore: number | undefined) => {
    if (semaphore === undefined || semaphore === 0) {
      return t('Unknown');
    }
    // if (semaphore === 0) {
    //   return t('Live');
    // }
    if (semaphore < 0) {
      return t('Training...');
    }
    return t('Loading...');
  };

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
        <Typography>{statusFromSemaphore(semaphore)}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{'TODO'}</Typography>
      </TableCell>
    </>
  );
};

export { SnapshotRow };
