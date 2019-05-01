import React, { useState, useEffect } from "react";
import {
  withStyles,
  Theme,
  createStyles,
  Grid,
  TextField,
  Button,
  Divider,
  LinearProgress,
  Snackbar
} from "@material-ui/core";
import { UntokenizedEditor } from "../widgets/UntokenizedEditor";
import NavigationBar from "../NavigationBar";
import classNames from "classnames";
import useAuthentication from "../hooks/useAuthentication";
import { EntityType } from "../types/EntityType";
import { useTranslation } from "react-i18next";
import { MaybeSpacyDocument } from "../types/optionals";
import { SpacyDocument } from "../apigen";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    },
    content: {
      padding: theme.spacing.unit * 2
    }
  });

type Props = {
  classes: any;
};

const PreviewLayout = ({ classes }: Props) => {
  const [text, setText] = useState<string>("");
  const [entityTypes, setEntityTypes] = useState<EntityType[]>([]);
  const [document, setDocument] = useState<MaybeSpacyDocument>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [t] = useTranslation();
  const { loggedIn } = useAuthentication();
  // TODO(jpo): Use new API.
  // const nerApi = new NerApi(nerModel);

  async function onParseClick() {
    setLoading(true);
    try {
      // TODO(jpo): Use new API.
      // const doc = await nerApi.parseText(text);
      // setDocument(doc as NerDocument);
    } catch (e) {
      // TODO: correctly handle this
      console.log("Fuuu", [e]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        // TODO(jpo): Use new API.
        // const entityTypeApi = new EntityTypeApi();
        // const availableTypes = await entityTypeApi.availableTypes("noticias");
        // setEntityTypes(availableTypes);
      } catch (e) {
        console.log([e]);
      }
    };
    fetchTypes();
  }, []);

  function onDocumentUpdate(document: SpacyDocument) {
    setDocument(prevState => {
      return { ...prevState, ...document };
    });
  }

  function onSaveClick() {
    if (!document) {
      return; // TODO: Handle this
    }

    // TODO(jpo): Use new API.
    // nerApi.save(document!).then(() => {
    //   setSnackbarMessage(t("Saved"));
    // }).catch((error) => {
    //   // TODO: Handle this.
    // });
  }

  return (
    <div>
      <NavigationBar />
      {loading && <LinearProgress />}
      <Grid
        container
        className={classNames(classes.content, classes.root)}
        direction="column"
        justify="space-around"
      >
        <Grid item>
          <Grid container direction="row" spacing={24} alignItems="center">
            <Grid item xs={10}>
              <TextField
                label={t("Text")}
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
                {t("Parse")}
              </Button>
            </Grid>
          </Grid>
        </Grid>
        {document == null || loading ? null : (
          <Grid item>
            <Divider style={{ marginTop: 10, marginBottom: 10 }} />
            <Grid
              container
              direction="row"
              spacing={24}
              justify="space-between"
            >
              <Grid item xs={10}>
                <UntokenizedEditor
                  document={document}
                  onUpdate={onDocumentUpdate}
                  entityTypes={entityTypes}
                />
              </Grid>
              <div>
                {loggedIn ? (
                  <Grid
                    item
                    xs={2}
                    style={{
                      marginTop: 2,
                      borderLeft: "1px solid rgba(0, 0, 0, 0.12)",
                      padding: "0.5em"
                    }}
                  >
                    <Button
                      variant="contained"
                      fullWidth
                      color="primary"
                      onClick={onSaveClick}
                    >
                      {t("Save")}
                    </Button>
                  </Grid>
                ) : null}
              </div>
            </Grid>
          </Grid>
        )}
      </Grid>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left"
        }}
        open={snackbarMessage != ""}
        autoHideDuration={1000}
        onClose={() => setSnackbarMessage("")}
        message={<span>{snackbarMessage}</span>}
      />
    </div>
  );
};

export default withStyles(styles)(PreviewLayout);
