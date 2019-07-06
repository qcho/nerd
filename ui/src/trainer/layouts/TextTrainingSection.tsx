/* eslint-disable @typescript-eslint/camelcase */
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Title } from '../widgets/Title';
import { Grid, Typography, Button } from '@material-ui/core';
import useCurrentSnapshot from '../hooks/useCurrentSnapshot';
import { Link } from 'react-router-dom';
import { Routes } from '../helpers/routeHelper';
import { TrainingStatus } from '../widgets/TrainingStatus';

const Subtitle = (props: any) => <Typography variant="subtitle1">{props.children}</Typography>;

const SubSection = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <Grid item>
    <Subtitle>{title}</Subtitle>
    <div style={{ paddingLeft: '1em' }}>{children}</div>
  </Grid>
);

const TextTrainingSection = () => {
  const [t] = useTranslation();
  const { currentSnapshot } = useCurrentSnapshot();
  return (
    <div>
      <Grid container spacing={16}>
        <Grid item>
          <Title>{t('Corpus')}</Title>
        </Grid>
        <Grid item>
          <Button
            size="small"
            color="primary"
            variant="contained"
            component={(props: any) => <Link to={Routes.corpus} {...props} />}
          >
            {t('View')}
          </Button>
        </Grid>
      </Grid>
      {/* {loading && <CircularProgress />} */}
      {currentSnapshot && (
        <Grid container direction="column">
          <SubSection title={t('Status')}>
            <TrainingStatus snapshotInfo={currentSnapshot} />
          </SubSection>
          <SubSection title={t('Total trained')}>
            <Typography variant="body1">{currentSnapshot.trained}</Typography>
          </SubSection>
          <SubSection title={t('Untrained')}>
            <Typography variant="body1">{currentSnapshot.available - currentSnapshot.trained}</Typography>
          </SubSection>
          <Grid item />
        </Grid>
      )}
    </div>
  );
};

export { TextTrainingSection };
