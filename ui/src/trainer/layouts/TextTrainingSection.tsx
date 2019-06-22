/* eslint-disable @typescript-eslint/camelcase */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Title } from '../widgets/Title';
import { Grid, Typography, Button, CircularProgress } from '@material-ui/core';
import { SnapshotsApi } from '../apigen';
import useCurrentSnapshot from '../hooks/useCurrentSnapshot';
import moment from 'moment';
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

const TextTrainingSection = () => {
  const [t] = useTranslation();
  const { currentSnapshot, loading, error } = useCurrentSnapshot();

  async function onForceTrain() {
    const api = new SnapshotsApi(apiConfig());
    try {
      // TODO: We need to block force train if semaphore is greater or equal than... 1?
      await api.forceTrain();
    } catch (e) {
      console.log(e);
    }
  }

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
