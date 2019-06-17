/* eslint-disable @typescript-eslint/camelcase */
import React from 'react';
import { CorpusSnapshot } from '../apigen';
import { TableCell, Tab } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

interface Props {
  snapshot: CorpusSnapshot;
}

const SnapshotRow = ({ snapshot }: Props) => {
  const [t] = useTranslation();
  const { id, trained_at, semaphore, created_at } = snapshot;
  const name = id === 0 ? t('Current') : `${id}`;
  // TODO: We should i18n moment.fromNow()

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
      <TableCell>{name}</TableCell>
      <TableCell>{moment(created_at).format('LLL')}</TableCell>
      <TableCell>{(trained_at && moment(trained_at).fromNow()) || t('Never')}</TableCell>
      <TableCell>{statusFromSemaphore(semaphore)}</TableCell>
      <TableCell>{'TODO'}</TableCell>
    </>
  );
};

export { SnapshotRow };
