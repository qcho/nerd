/* eslint-disable @typescript-eslint/camelcase */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Title } from '../widgets/Title';
import { Grid, Typography, Button, Tooltip, CircularProgress } from '@material-ui/core';
import { Line } from 'rc-progress';
import { SnapshotInfo, SnapshotsApi } from '../apigen';
import useCurrentSnapshot from '../hooks/useCurrentSnapshot';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { Routes } from '../helpers/routeHelper';
import { apiConfig } from '../helpers/api-config';

const TrainingStatus = ({ snapshotInfo }: { snapshotInfo: SnapshotInfo }) => {
  const [t] = useTranslation();
  const { corpus_size, trained_distinct } = snapshotInfo;
  const trainedPercentage = Math.ceil((trained_distinct > 0 ? (trained_distinct / corpus_size) * 100 : 0) * 100) / 100;

  const progressColor = (percentage: number) => {
    if (percentage < 40) {
      return '#D2222D';
    }
    if (percentage < 70) {
      return '#FFBF00';
    }
    if (percentage < 100) {
      return '#0099E5';
    }
    return '#238823';
  };

  return (
    <div>
      <Typography variant="body1">
        {t('{{trained}} of {{total}} trained', {
          total: corpus_size,
          trained: trained_distinct,
        })}
      </Typography>
      <Tooltip title={`${trainedPercentage}%`} placement="right">
        <div
          style={{
            marginTop: '-0.8em',
            width: '6em',
            height: '1em',
            verticalAlign: 'top',
          }}
        >
          <Line
            percent={trainedPercentage}
            strokeColor={progressColor(trainedPercentage)}
            strokeWidth={3}
            trailWidth={3}
          />
        </div>
      </Tooltip>
    </div>
  );
};

const Subtitle = (props: any) => <Typography variant="subtitle1">{props.children}</Typography>;

const SubSection = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <Grid item>
    <Subtitle>{title}</Subtitle>
    <div style={{ paddingLeft: '1em' }}>{children}</div>
  </Grid>
);

async function onForceTrain() {
  const api = new SnapshotsApi(apiConfig());
  try {
    // TODO: We need to block force train if semaphore is greater or equal than... 1?
    await api.forceTrain();
  } catch (e) {
    console.log(e);
  }
}

const TextTrainingSection = () => {
  const [t] = useTranslation();
  const { currentSnapshot, loading, error } = useCurrentSnapshot();

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
      {loading && <CircularProgress />}
      {currentSnapshot && (
        <Grid container direction="column">
          <SubSection title={t('Status')}>
            <TrainingStatus snapshotInfo={currentSnapshot} />
          </SubSection>
          <SubSection title={t('Last training')}>
            <Grid container spacing={8}>
              <Grid item>
                <Typography variant="body1">{moment(currentSnapshot.snapshot.trained_at).fromNow()}</Typography>
              </Grid>
              <Grid item>
                <Button size="small" color="primary" onClick={onForceTrain}>
                  {t('Train now')}
                </Button>
              </Grid>
            </Grid>
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
