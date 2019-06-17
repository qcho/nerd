import React from 'react';
import { useTranslation } from 'react-i18next';
import { Title } from '../widgets/Title';
import { Grid, Paper, Typography, Button } from '@material-ui/core';
import { Line } from 'rc-progress';

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

const TextTrainingSection = () => {
  const totalTexts = 1000;
  const trainedTexts = 1000;
  const percentageTrained = (trainedTexts / totalTexts) * 100;
  const [t] = useTranslation();
  return (
    <div>
      <Title>{t('Corpus')}</Title>
      <Paper>
        <Grid container alignItems="flex-end">
          <Grid item>
            <div
              style={{
                width: '10em',
                height: '1em',
                verticalAlign: 'top',
              }}
            >
              <Line
                percent={percentageTrained}
                strokeColor={progressColor(percentageTrained)}
                strokeWidth={3}
                trailWidth={3}
              />
            </div>
            <Typography variant="body1">
              {t('{{trained}} of {{total}} trained', {
                total: totalTexts,
                trained: trainedTexts,
              })}
            </Typography>
          </Grid>
          <Grid item>
            <Button style={{ marginTop: '1em' }} size="small" color="primary" variant="contained">
              View all
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export { TextTrainingSection };
