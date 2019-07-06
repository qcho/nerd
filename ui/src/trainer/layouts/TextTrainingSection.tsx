/* eslint-disable @typescript-eslint/camelcase */
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Title } from '../widgets/Title';
import { Grid, Typography, Button } from '@material-ui/core';
import { SnapshotsApi, Snapshot } from '../apigen';
import useCurrentSnapshot from '../hooks/useCurrentSnapshot';
import { snapshotStatus, SnapshotStatus, moment } from '../helpers/utils';
import { Link } from 'react-router-dom';
import { Routes } from '../helpers/routeHelper';
import { apiConfig } from '../helpers/api-config';
import { TrainingStatus } from '../widgets/TrainingStatus';

const Subtitle = (props: any) => <Typography variant="subtitle1">{props.children}</Typography>;

const SubSection = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <Grid item>
    <Subtitle>{title}</Subtitle>
    <div style={{ paddingLeft: '1em' }}>{children}</div>
  </Grid>
);

const TrainSubSection = () => {
  const [t] = useTranslation();
  const { currentSnapshot, startRefresh, endRefresh, isRefreshing } = useCurrentSnapshot();
  const [status, setStatus] = useState<SnapshotStatus>(SnapshotStatus.UNKNOWN);
  const [lastKnownStatusText, setLastKnownStatusText] = useState<string>('');

  const isReadyToTrain = (snapshot: Snapshot) => snapshot.semaphore === 0;

  const trainingStatus = useCallback(
    (snapshot: Snapshot) => {
      if (status == SnapshotStatus.LOADING) return t('Loading from disk');
      if (status == SnapshotStatus.TRAINING) return t('Training');
      if (snapshot.trained_at) return moment(snapshot.trained_at).fromNow();
      return t('Never');
    },
    [status, t],
  );

  useMemo(() => {
    if (currentSnapshot) setStatus(snapshotStatus(currentSnapshot.snapshot));
    if (currentSnapshot) setLastKnownStatusText(trainingStatus(currentSnapshot.snapshot));
  }, [currentSnapshot, trainingStatus]);

  if (currentSnapshot && !isReadyToTrain(currentSnapshot.snapshot) && !isRefreshing) startRefresh();

  if (isRefreshing && currentSnapshot) {
    if (isReadyToTrain(currentSnapshot.snapshot)) endRefresh();
  }

  async function onForceTrain() {
    const api = new SnapshotsApi(apiConfig());
    try {
      await api.forceTrain({ version: 'vCURRENT' });
      startRefresh();
    } catch (e) {
      console.log(e);
    }
  }

  return (
    (currentSnapshot && (
      <Grid container spacing={8}>
        <Grid item>
          <Typography variant="body1">{trainingStatus(currentSnapshot.snapshot)}</Typography>
        </Grid>
        <Grid item>
          {isReadyToTrain(currentSnapshot.snapshot) && (
            <Button size="small" color="primary" onClick={onForceTrain}>
              {t('Train now')}
            </Button>
          )}
        </Grid>
      </Grid>
    )) || <Typography variant="body1">{lastKnownStatusText}</Typography>
  );
};

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
          <SubSection title={t('Last training')}>
            <TrainSubSection />
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
