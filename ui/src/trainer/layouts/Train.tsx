import React, { useState, useEffect } from "react";
import {
  LinearProgress,
  Paper,
  Theme,
  Toolbar,
  Typography,
  AppBar,
  Button
} from "@material-ui/core";
import NavigationBar from "../NavigationBar";
import { makeStyles } from "@material-ui/styles";
import { UntokenizedEditor } from "../widgets/UntokenizedEditor";
import { useTranslation } from "react-i18next";
import { CorpusApi, SpacyDocument } from "../apigen";
import { apiConfig } from "../helpers/api-config";
import { MaybeTrainText, MaybeSpacyDocument } from "../types/optionals";

const useStyles = makeStyles(
  (theme: Theme) => ({
    container: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
      alignItems: "center",
      height: "100vh"
    },
    paper: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
      width: "60vw",
      marginTop: theme.spacing.unit * 8,
      marginBottom: theme.spacing.unit * 8,
      padding: theme.spacing.unit * 2
    },
    spacer: {
      flex: "1 1 100%"
    },
    actionBar: {
      marginBottom: theme.spacing.unit
    },
    actions: {
      display: "flex",
      flex: 1,
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-around"
    }
  }),
  { withTheme: true }
);

const Train = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [trainText, setTrainText] = useState<MaybeTrainText>(null);
  const [spacyDocument, setSpacyDocument] = useState<MaybeSpacyDocument>(null);
  const api = new CorpusApi(apiConfig());

  const classes = useStyles();
  const [t] = useTranslation();

  useEffect(() => {
    loadNewDocument();
  }, []);

  const loadNewDocument = async () => {
    setLoading(true);
    try {
      const trainingInfoResult = await api.train();
      setTrainText(trainingInfoResult.data);
      setSpacyDocument(trainingInfoResult.data.spacy_document);
    } catch (e) {
      console.log("Error getting training info", e);
      setTrainText(null);
      setSpacyDocument(null);
    }

    setHasChanges(false);
    setLoading(false);
  };

  const onDocumentUpdate = async (trainedDocument: SpacyDocument) => {
    setHasChanges(true);
    setSpacyDocument(trainedDocument);
  };

  const onReset = () => {
    setHasChanges(false);
    // TODO: Reset text
  };

  const onSkip = () => {
    loadNewDocument();
  };

  const onSave = async () => {
    api.upsertTraining_1(trainText!.text_id, spacyDocument!);
  };
  console.log([trainText, spacyDocument]);

  return (
    <div className={classes.container}>
      <NavigationBar />
      {loading && <LinearProgress />}
      {spacyDocument != null && (
        <Paper className={classes.paper}>
          <AppBar
            color="default"
            position="relative"
            className={classes.actionBar}
          >
            <Toolbar>
              <div className={classes.actions}>
                <Button
                  color="secondary"
                  variant="contained"
                  disabled={!hasChanges}
                  onClick={onReset}
                >
                  <Typography
                    style={{ paddingLeft: 80, paddingRight: 80 }}
                    color="inherit"
                    variant="h6"
                    id="tableTitle"
                  >
                    {t("RESET")}
                  </Typography>
                </Button>
                <Button color="inherit" onClick={onSkip}>
                  <Typography
                    style={{ paddingLeft: 80, paddingRight: 80 }}
                    color="inherit"
                    variant="h6"
                    id="tableTitle"
                  >
                    {t("SKIP")}
                  </Typography>
                </Button>
                <Button
                  color="primary"
                  variant="contained"
                  disabled={!hasChanges}
                  onClick={onSave}
                >
                  <Typography
                    style={{ paddingLeft: 80, paddingRight: 80 }}
                    color="inherit"
                    variant="h6"
                    id="tableTitle"
                  >
                    {t("SAVE")}
                  </Typography>
                </Button>
              </div>
            </Toolbar>
          </AppBar>
          <UntokenizedEditor
            document={spacyDocument!}
            entityTypes={trainText!.snapshot!.types!}
            onUpdate={onDocumentUpdate}
          />
        </Paper>
      )}
    </div>
  );
};

export default Train;
