import React, { useState } from 'react';
import { withStyles, Theme, createStyles, Grid, TextField, Button, Divider } from '@material-ui/core';
import useAuthentication from '../hooks/useAuthentication';
import { useTranslation } from 'react-i18next';
import { MaybeSpacyDocument } from '../types/optionals';
import { SpacyDocument, Type, NerApi, CorpusApi } from '../apigen';
import TokenizedEditor from '../widgets/TokenizedEditor';
import Http from '../helpers/http';
import { Scaffold } from '../widgets/Scaffold';
import { apiConfig } from '../helpers/api-config';
import { SuccessSnackbar, ErrorSnackbar, WarningSnackbar } from '../widgets/Snackbars';

const styles = (theme: Theme) =>
  createStyles({
    content: {
      padding: theme.spacing.unit * 2,
    },
  });

interface Props {
  classes: any;
}

const PreviewLayout = ({ classes }: Props) => {
  const [text, setText] = useState<string>('');
  const [entityTypes, setEntityTypes] = useState<{ [key: string]: Type }>({});
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [warningMessage, setWarningMessage] = useState<string>('');
  const [document, setDocument] = useState<MaybeSpacyDocument>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saveEnabled, setSaveEnabled] = useState<boolean>(false);
  const [t] = useTranslation();
  const { isUser } = useAuthentication();
  const nerApi = new NerApi(apiConfig());

  async function onParseClick() {
    if (text.trim().length == 0) {
      setWarningMessage(t('Please write some text'));
      return;
    }
    setLoading(true);
    try {
      const response = await nerApi.textParse_2(text);
      setDocument(response.data.spacy_document);
      setEntityTypes(response.data.snapshot.types || {});
      setSaveEnabled(true);
    } catch (e) {
      const message = Http.handleRequestError(e, (statusCode, data) => {
        if ([404, 500].indexOf(statusCode) < 0) {
          return t('There was an error while trying to reach the server');
        }
        return '';
      });
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  function onDocumentUpdate(document: SpacyDocument) {
    setDocument(prevState => {
      return { ...prevState, ...document };
    });
  }

  async function onSaveClick() {
    setSaveEnabled(false);
    if (!document) {
      return; // Shouldn't happen
    }
    const api = new CorpusApi(apiConfig());
    try {
      const textResponse = await api.addNewText({ value: document.text });
      if (textResponse.data.id === undefined) {
        return; // Shouldn't happen
      }
      await api.upsertMyTraining(textResponse.data.id, document);
      setSuccessMessage(t('Saved'));
    } catch (e) {
      setErrorMessage(
        Http.handleRequestError(e, (status, data) => {
          // TODO: Handle specific error codes
          return '';
        }),
      );
    }
  }

  return (
    <Scaffold title={t('NER sandbox')} loading={loading}>
      <Grid container className={classes.content} direction="column" justify="space-around">
        <Grid item>
          <Grid container direction="row" spacing={24} alignItems="center">
            <Grid item xs={10}>
              <TextField
                label={t('Text')}
                type="search"
                margin="normal"
                variant="outlined"
                multiline
                fullWidth
                value={text}
                onChange={event => {
                  let text = event.target.value;
                  if (!text || !text.length) {
                    return;
                  }
                  setText(text);
                }}
              />
            </Grid>
            <Grid item xs={2}>
              <Button fullWidth color="primary" onClick={onParseClick}>
                {t('Parse')}
              </Button>
            </Grid>
          </Grid>
        </Grid>
        {document == null || loading ? null : (
          <Grid item>
            <Divider style={{ marginTop: 10, marginBottom: 10 }} />
            <Grid container direction="row" spacing={24} justify="space-between">
              <Grid item xs={10}>
                <TokenizedEditor
                  readOnly={!isUser}
                  spacyDocument={{ ...document }}
                  onUpdate={onDocumentUpdate}
                  entityTypes={entityTypes}
                />
              </Grid>
              {isUser ? (
                <div>
                  <Grid
                    item
                    xs={2}
                    style={{
                      marginTop: 2,
                      borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
                      padding: '0.5em',
                    }}
                  >
                    <Button variant="contained" fullWidth color="primary" onClick={onSaveClick} disabled={!saveEnabled}>
                      {t('Save')}
                    </Button>
                  </Grid>
                </div>
              ) : null}
            </Grid>
          </Grid>
        )}
      </Grid>
      <SuccessSnackbar message={successMessage} onClose={() => setSuccessMessage('')} />
      <ErrorSnackbar message={errorMessage} onClose={() => setErrorMessage('')} />
      <WarningSnackbar message={warningMessage} onClose={() => setWarningMessage('')} />
    </Scaffold>
  );
};

export default withStyles(styles)(PreviewLayout);
