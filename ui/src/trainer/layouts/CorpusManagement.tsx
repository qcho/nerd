import React, { useState, useEffect, useCallback } from 'react';
import { Theme, Grid, LinearProgress, Typography, Button, Divider } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/styles';
import { Line } from 'rc-progress';
import { Scaffold } from '../widgets/Scaffold';
import { SnapshotSection } from './SnapshotSection';
import { TextTrainingSection } from './TextTrainingSection';

const useStyles = makeStyles(
  (theme: Theme) => ({
    section: {
      marginBottom: '1em',
    },
  }),
  { withTheme: true },
);

const CorpusManagement = () => {
  const [t] = useTranslation();
  const classes = useStyles();

  return (
    <Scaffold title={t('Corpus Management')}>
      <div style={{ width: '60vw' }}>
        <div className={classes.section}>
          <TextTrainingSection />
        </div>
        <div className={classes.section}>
          <SnapshotSection />
        </div>
      </div>
    </Scaffold>
  );
};

export default CorpusManagement;
