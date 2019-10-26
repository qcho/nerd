import React, { useState, useEffect } from 'react';
import { Paper, Theme, Toolbar, Typography, AppBar, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useTranslation } from 'react-i18next';
import { CorpusApi, SpacyDocument, NerApi } from '../apigen';
import { apiConfig } from '../helpers/api-config';
import { MaybeTrainText, MaybeSpacyDocument } from '../types/optionals';
import { TokenizedEditor } from '../token_editor/TokenizedEditor';
import { clone } from '../helpers/utils';
import { Scaffold } from '../scaffold/Scaffold';
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
  const [nextTrainText, setNextTrainText] = useState<MaybeTrainText>(null);
  const [spacyDocument, setSpacyDocument] = useState<MaybeSpacyDocument>(null);
  const [noMoreDocuments, setNoMoreDocuments] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const api = new CorpusApi(apiConfig());
  const nerApi = new NerApi(apiConfig());
  let unmounted = false;

  const classes = useStyles();
  const [t] = useTranslation();

  const asyncLoadNextDocument = async () => {
    if (nextTrainText != null) return;
    const nextTrainingResponse = await nerApi.trainNer();
    const { data, status } = nextTrainingResponse;
    if (status == 204 || (trainText && data.text_id == trainText.text_id)) {
      setNextTrainText(null);
      return;
    }
    setNextTrainText(data);
  };

  const loadNewDocument = async () => {
    if (unmounted) return;
    if (nextTrainText != null) {
      setTrainText(nextTrainText);
      setSpacyDocument(clone(nextTrainText.spacy_document));
      setNextTrainText(null);
      asyncLoadNextDocument();
      return;
    }
    setLoading(true);
    try {
      const trainingInfoResult = await nerApi.trainNer();
      const noDocumentsLeft = trainingInfoResult.status == 204;
      setTrainText(noDocumentsLeft ? null : trainingInfoResult.data);
      setSpacyDocument(noDocumentsLeft ? null : clone(trainingInfoResult.data.spacy_document));
      setNoMoreDocuments(noDocumentsLeft);
      asyncLoadNextDocument();
    } catch (e) {
      if (unmounted) return;
      setTrainText(null);
      setSpacyDocument(null);
      setErrorMessage(
        Http.handleRequestError(e, (status, data) => {
          return t('There was an error while retrieving a text to train.');
        }),
      );
    } finally {
      setHasChanges(false);
      setLoading(false);
    }
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
            <Typography>{t('No more documents to train!')}</Typography>
          </Paper>
        )}
        {loading && !spacyDocument && <Typography>{t('Loading')}</Typography>}
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
                  <Button color="primary" variant="contained" onClick={onSave} disabled={loading}>
                    <Typography
                      style={{ paddingLeft: 80, paddingRight: 80 }}
                      color="inherit"
                      variant="h6"
                      id="tableTitle"
                    >
                      {t('ACCEPT')}
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
