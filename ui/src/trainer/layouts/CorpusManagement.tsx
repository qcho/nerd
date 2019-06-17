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
      <Grid container spacing={40} style={{ paddingLeft: '2em', paddingRight: '2em', paddingTop: '1em' }}>
        <Grid item className={classes.section} xs={2}>
          <TextTrainingSection />
        </Grid>
        <Grid item className={classes.section} xs={10}>
          <SnapshotSection />
        </Grid>
      </Grid>
    </Scaffold>
  );
};

export default CorpusManagement;
