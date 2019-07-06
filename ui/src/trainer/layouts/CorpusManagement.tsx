import React from 'react';
import { Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/styles';
import { Scaffold } from '../widgets/Scaffold';
import { SnapshotSection } from './SnapshotSection';
import { TextTrainingSection } from './TextTrainingSection';
import { ManageSnapshot } from './ManageSnapshot';
import { WorkerSection } from './WorkerSection';

const useStyles = makeStyles({
  section: {
    marginBottom: '1em',
  },
});

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
          <Grid container direction="column">
            <Grid item>
              <ManageSnapshot />
            </Grid>
            <Grid item style={{ marginTop: '0.5em' }}>
              <SnapshotSection />
            </Grid>
            <Grid item style={{ marginTop: '0.5em' }}>
              <WorkerSection />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Scaffold>
  );
};

export default CorpusManagement;
