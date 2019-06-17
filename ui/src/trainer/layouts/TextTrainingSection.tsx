/* eslint-disable @typescript-eslint/camelcase */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Title } from '../widgets/Title';
import { Grid, Typography, Button } from '@material-ui/core';
import { Line } from 'rc-progress';
import { apiConfig } from '../helpers/api-config';
import { SnapshotsApi, SnapshotInfo } from '../apigen';
import { MaybeSnapshotInfo } from '../types/optionals';
import moment from 'moment';

const TrainingStatus = ({ snapshotInfo }: { snapshotInfo: SnapshotInfo }) => {
  const [t] = useTranslation();
  const { corpus_size, trained_distinct } = snapshotInfo;
  const trainedPercentage = trained_distinct > 0 ? (corpus_size / trained_distinct) * 100 : 0;

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

const TextTrainingSection = () => {
  const [snapshotInfo, setSnapshotInfo] = useState<MaybeSnapshotInfo>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [t] = useTranslation();

  useEffect(() => {
    setLoading(true);
    async function fetchSnapshot() {
      const api = new SnapshotsApi(apiConfig());
      try {
        const result = await api.getCurrentSnapshot();
        console.log(result.data);
        setSnapshotInfo(result.data);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }
    fetchSnapshot();
  }, []);

  return (
    <div>
      <Grid container spacing={16}>
        <Grid item>
          <Title>{t('Corpus')}</Title>
        </Grid>
        <Grid item>
          <Button size="small" color="primary" variant="contained">
            {t('View')}
          </Button>
        </Grid>
      </Grid>
      {snapshotInfo && (
        <Grid container direction="column">
          <SubSection title={t('Status')}>
            <TrainingStatus snapshotInfo={snapshotInfo} />
          </SubSection>
          <SubSection title={t('Last training')}>
            <Typography variant="body1">{moment(snapshotInfo.snapshot.trained_at).fromNow()}</Typography>
          </SubSection>
          <SubSection title={t('Total trained')}>
            <Typography variant="body1">{snapshotInfo.trained}</Typography>
          </SubSection>
          <SubSection title={t('Untrained')}>
            <Typography variant="body1">{snapshotInfo.available - snapshotInfo.trained}</Typography>
          </SubSection>
          <Grid item />
        </Grid>
      )}
    </div>
  );
};

export { TextTrainingSection };
