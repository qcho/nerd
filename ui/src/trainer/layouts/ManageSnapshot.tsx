import React from 'react';
import { useTranslation } from 'react-i18next';
import { Title } from '../widgets/Title';
import { Paper, Typography } from '@material-ui/core';
import useCurrentSnapshot from '../hooks/useCurrentSnapshot';

const ManageSnapshot = () => {
  const [t] = useTranslation();
  const { currentSnapshot, loading, error } = useCurrentSnapshot();

  return (
    <div>
      <Title>{t('Types')}</Title>
      <Paper style={{ padding: '1em' }}>
        <Typography>{'Work in progress...'}</Typography>
      </Paper>
    </div>
  );
};

export { ManageSnapshot };
