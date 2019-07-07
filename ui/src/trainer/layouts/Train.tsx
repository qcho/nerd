import React, { useState, useEffect } from 'react';
import { Paper, Theme, Toolbar, Typography, AppBar, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useTranslation } from 'react-i18next';
import { CorpusApi, SpacyDocument } from '../apigen';
import { apiConfig } from '../helpers/api-config';
import { MaybeTrainText, MaybeSpacyDocument } from '../types/optionals';
import TokenizedEditor from '../widgets/TokenizedEditor';
import { clone } from '../helpers/utils';
import { Scaffold } from '../widgets/Scaffold';
import { ErrorSnackbar } from '../widgets/Snackbars';
import Http from '../helpers/http';

const useStyles = makeStyles(
  (theme: Theme) => ({
    container: {
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
    },
    paper: {
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
      [theme.breakpoints.down('sm')]: {
        marginTop: theme.spacing.unit * 3,
        width: '90vw',
      },
      [theme.breakpoints.up('md')]: {
        marginTop: theme.spacing.unit * 6,
        width: '80vw',
      },
      [theme.breakpoints.up('lg')]: {
        marginTop: theme.spacing.unit * 8,
        width: '60vw',
      },
      marginBottom: theme.spacing.unit * 8,
      padding: theme.spacing.unit * 2,
    },
    spacer: {
      flex: '1 1 100%',
    },
    actionBar: {
      marginBottom: theme.spacing.unit,
    },
    actions: {
      display: 'flex',
      flex: 1,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  }),
  { withTheme: true },
);

const Train = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [trainText, setTrainText] = useState<MaybeTrainText>(null);
  const [spacyDocument, setSpacyDocument] = useState<MaybeSpacyDocument>(null);
  const [noMoreDocuments, setNoMoreDocuments] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const api = new CorpusApi(apiConfig());
  let unmounted = false;

  const classes = useStyles();
  const [t] = useTranslation();

  const loadNewDocument = async () => {
    setLoading(true);
    try {
      const trainingInfoResult = await api.trainNew();
      if (unmounted) return;
      if (trainingInfoResult.status == 204) {
        setNoMoreDocuments(true);
        setTrainText(null);
        setSpacyDocument(null);
      } else {
        setNoMoreDocuments(false);
        setTrainText(trainingInfoResult.data);
        setSpacyDocument(clone(trainingInfoResult.data.spacy_document));
      }
    } catch (e) {
      if (unmounted) return;
      setTrainText(null);
      setSpacyDocument(null);
      setErrorMessage(
        Http.handleRequestError(e, (status, data) => {
          return t('There was an error while retrieving a text to train.');
        }),
      );
    }

    setHasChanges(false);
    setLoading(false);
  };

  const onDocumentUpdate = async (trainedDocument: SpacyDocument) => {
    setHasChanges(true);
    setSpacyDocument({ ...clone(spacyDocument), ...trainedDocument });
  };

  const onReset = () => {
    if (!trainText) return;
    setHasChanges(false);
    setSpacyDocument(clone(trainText.spacy_document));
  };

  const onSave = async () => {
    try {
      if (!(trainText && spacyDocument)) return;
      await api.addTextTraining(trainText.text_id, spacyDocument);
      loadNewDocument();
    } catch (e) {}
  };

  useEffect(() => {
    loadNewDocument();
    return () => {
      unmounted = true;
    };
  }, []);

  return (
    <Scaffold title={t('Train')} loading={loading}>
      <div className={classes.container}>
        {noMoreDocuments && (
          <Paper className={classes.paper}>
            {/* TODO: Show something nice here */}
            <Typography>{t('No more documents to train!')}</Typography>
          </Paper>
        )}
        {spacyDocument && trainText && (
          <Paper className={classes.paper}>
            <AppBar color="default" position="relative" className={classes.actionBar}>
              <Toolbar>
                <div className={classes.actions}>
                  <Button color="secondary" variant="contained" disabled={!hasChanges} onClick={onReset}>
                    <Typography
                      style={{ paddingLeft: 80, paddingRight: 80 }}
                      color="inherit"
                      variant="h6"
                      id="tableTitle"
                    >
                      {t('RESET')}
                    </Typography>
                  </Button>
                  <div style={{ width: '1em' }} />
                  <Button color="primary" variant="contained" onClick={onSave}>
                    <Typography
                      style={{ paddingLeft: 80, paddingRight: 80 }}
                      color="inherit"
                      variant="h6"
                      id="tableTitle"
                    >
                      {t(hasChanges ? 'SAVE' : 'SKIP')}
                    </Typography>
                  </Button>
                </div>
              </Toolbar>
            </AppBar>
            <TokenizedEditor
              spacyDocument={{ ...spacyDocument }}
              entityTypes={trainText.snapshot.types || {}}
              onUpdate={onDocumentUpdate}
            />
          </Paper>
        )}
        <ErrorSnackbar message={errorMessage} onClose={() => setErrorMessage('')} />
      </div>
    </Scaffold>
  );
};

export default Train;
