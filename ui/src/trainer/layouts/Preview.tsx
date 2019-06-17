import React, { useState } from 'react';
import { withStyles, Theme, createStyles, Grid, TextField, Button, Divider, Snackbar } from '@material-ui/core';
import classNames from 'classnames';
import useAuthentication from '../hooks/useAuthentication';
import { useTranslation } from 'react-i18next';
import { MaybeSpacyDocument } from '../types/optionals';
import { SpacyDocument, Type, NerApi } from '../apigen';
import TokenizedEditor from '../widgets/TokenizedEditor';
import Http from '../helpers/http';
import { ErrorMessage } from '../widgets/ErrorMessage';
import { Scaffold } from '../widgets/Scaffold';

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
  const [document, setDocument] = useState<MaybeSpacyDocument>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [t] = useTranslation();
  const { isUser } = useAuthentication();
  const nerApi = new NerApi();

  async function onParseClick() {
    setLoading(true);
    try {
      const response = await nerApi.textParse_2({ text });
      setDocument(response.data.spacy_document);
      setEntityTypes(response.data.snapshot.types || {});
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

  function onSaveClick() {
    if (!document) {
      return; // Shouldn't happen
    }
    // TODO: Implement this
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
        {errorMessage.length > 0 && <ErrorMessage message={errorMessage} />}
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
                    <Button variant="contained" fullWidth color="primary" onClick={onSaveClick}>
                      {t('Save')}
                    </Button>
                  </Grid>
                </div>
              ) : null}
            </Grid>
          </Grid>
        )}
      </Grid>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={snackbarMessage != ''}
        autoHideDuration={1000}
        onClose={() => setSnackbarMessage('')}
        message={<span>{snackbarMessage}</span>}
      />
    </Scaffold>
  );
};

export default withStyles(styles)(PreviewLayout);
