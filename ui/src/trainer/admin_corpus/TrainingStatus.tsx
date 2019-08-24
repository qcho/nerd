/* eslint-disable @typescript-eslint/camelcase */
import React from 'react';
import { Typography, Tooltip } from '@material-ui/core';
import { Line } from 'rc-progress';
import { SnapshotInfo } from '../apigen';
import { useTranslation } from 'react-i18next';

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
      <Tooltip title={<Typography color="inherit">{`${trainedPercentage}%`}</Typography>} placement="right">
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

export { TrainingStatus };
